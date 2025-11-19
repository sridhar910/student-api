const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const Student = require('./models/Student');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log(err));

// ==================== ROUTES ====================

// Add a student
app.post('/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({ message: 'Student added', student });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get students with pagination, filtering, and sorting
app.get('/students', async (req, res) => {
    try {
        const { page = 1, limit = 5, grade, city, sortBy = 'name', order = 'asc' } = req.query;

        const filter = {};
        if (grade) filter.grade = grade;
        if (city) filter.city = city;

        const students = await Student.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Student.countDocuments(filter);

        res.json({
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            totalStudents: total,
            students
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Default route
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Start server
app.listen(process.env.PORT, () => console.log(`🚀 Server running at http://localhost:${process.env.PORT}`));