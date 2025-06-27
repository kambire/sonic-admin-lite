
const db = require('../config/database');

class ClientsController {
  async getAll(req, res) {
    try {
      const clients = await db.query(`
        SELECT 
          id,
          name,
          email,
          phone,
          status,
          DATE_FORMAT(created_at, '%Y-%m-%d') as createdAt
        FROM clients 
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        data: clients
      });
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching clients' 
      });
    }
  }

  async create(req, res) {
    try {
      const { name, email, phone } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required'
        });
      }

      const result = await db.query(
        'INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)',
        [name, email, phone || null]
      );

      const newClient = await db.query(
        'SELECT id, name, email, phone, status, DATE_FORMAT(created_at, "%Y-%m-%d") as createdAt FROM clients WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: newClient[0]
      });
    } catch (error) {
      console.error('Create client error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      res.status(500).json({ 
        success: false, 
        message: 'Error creating client' 
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, status } = req.body;

      await db.query(
        'UPDATE clients SET name = ?, email = ?, phone = ?, status = ? WHERE id = ?',
        [name, email, phone, status, id]
      );

      const updatedClient = await db.query(
        'SELECT id, name, email, phone, status, DATE_FORMAT(created_at, "%Y-%m-%d") as createdAt FROM clients WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        data: updatedClient[0]
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating client' 
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await db.query('DELETE FROM clients WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting client' 
      });
    }
  }
}

module.exports = new ClientsController();
