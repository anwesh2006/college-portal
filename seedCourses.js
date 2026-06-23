/**
 * Seed script to populate the database with courses.
 * Run: node seedCourses.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const courses = [
    // Computer Science
    { title: 'Data Structures & Algorithms', code: 'CS201', credits: 4, department: 'CS', description: 'Study of fundamental data structures including arrays, linked lists, trees, graphs, and associated algorithms.', schedule: 'Mon/Wed/Fri 9:00-10:00', totalSlots: 60 },
    { title: 'Operating Systems', code: 'CS301', credits: 4, department: 'CS', description: 'Concepts of process management, memory management, file systems, and I/O systems.', schedule: 'Tue/Thu 10:00-11:30', totalSlots: 50 },
    { title: 'Database Management Systems', code: 'CS302', credits: 3, department: 'CS', description: 'Relational databases, SQL, normalization, transaction processing, and NoSQL databases.', schedule: 'Mon/Wed 11:00-12:30', totalSlots: 55 },
    { title: 'Computer Networks', code: 'CS303', credits: 3, department: 'CS', description: 'Network architectures, protocols, TCP/IP, routing algorithms, and network security.', schedule: 'Tue/Thu 2:00-3:30', totalSlots: 50 },
    { title: 'Artificial Intelligence', code: 'CS401', credits: 3, department: 'CS', description: 'Introduction to AI including search algorithms, machine learning, neural networks, and NLP.', schedule: 'Mon/Wed/Fri 11:00-12:00', totalSlots: 45 },
    { title: 'Web Development', code: 'CS402', credits: 3, department: 'CS', description: 'Full-stack web development with HTML, CSS, JavaScript, Node.js, React, and databases.', schedule: 'Tue/Thu 9:00-10:30', totalSlots: 40 },
    { title: 'Machine Learning', code: 'CS403', credits: 3, department: 'CS', description: 'Supervised and unsupervised learning, regression, classification, clustering, and deep learning.', schedule: 'Mon/Wed 2:00-3:30', totalSlots: 40 },
    { title: 'Cybersecurity', code: 'CS404', credits: 3, department: 'CS', description: 'Network security, cryptography, ethical hacking, penetration testing, and security protocols.', schedule: 'Fri 10:00-1:00', totalSlots: 35 },
    { title: 'Cloud Computing', code: 'CS405', credits: 3, department: 'CS', description: 'Cloud service models, AWS, Azure, containerization, microservices architecture.', schedule: 'Tue/Thu 3:30-5:00', totalSlots: 40 },
    { title: 'Software Engineering', code: 'CS304', credits: 3, department: 'CS', description: 'Software development lifecycle, agile methodologies, design patterns, testing, and project management.', schedule: 'Mon/Wed 9:00-10:30', totalSlots: 55 },

    // Electronics & Communication
    { title: 'Digital Electronics', code: 'EC201', credits: 4, department: 'EC', description: 'Digital logic gates, combinational and sequential circuits, flip-flops, and counters.', schedule: 'Mon/Wed/Fri 10:00-11:00', totalSlots: 50 },
    { title: 'Signal Processing', code: 'EC301', credits: 3, department: 'EC', description: 'Analog and digital signal processing, Fourier transforms, filters, and spectral analysis.', schedule: 'Tue/Thu 11:00-12:30', totalSlots: 45 },
    { title: 'Microprocessors & Microcontrollers', code: 'EC302', credits: 4, department: 'EC', description: 'Architecture of 8085, 8086, ARM processors, assembly language, and embedded programming.', schedule: 'Mon/Wed 2:00-3:30', totalSlots: 45 },
    { title: 'Communication Systems', code: 'EC303', credits: 3, department: 'EC', description: 'Analog and digital communication, modulation techniques, and wireless communication.', schedule: 'Tue/Thu 9:00-10:30', totalSlots: 50 },
    { title: 'VLSI Design', code: 'EC401', credits: 3, department: 'EC', description: 'CMOS technology, VLSI design flow, HDL programming, and chip fabrication.', schedule: 'Mon/Wed/Fri 11:00-12:00', totalSlots: 35 },

    // Mechanical Engineering
    { title: 'Thermodynamics', code: 'ME201', credits: 4, department: 'ME', description: 'Laws of thermodynamics, entropy, enthalpy, heat engines, and refrigeration cycles.', schedule: 'Mon/Wed/Fri 9:00-10:00', totalSlots: 60 },
    { title: 'Fluid Mechanics', code: 'ME301', credits: 3, department: 'ME', description: 'Fluid statics, dynamics, viscous flow, boundary layers, and turbulence.', schedule: 'Tue/Thu 10:00-11:30', totalSlots: 50 },
    { title: 'Machine Design', code: 'ME302', credits: 3, department: 'ME', description: 'Design of mechanical components including shafts, gears, bearings, and springs.', schedule: 'Mon/Wed 11:00-12:30', totalSlots: 50 },
    { title: 'Manufacturing Technology', code: 'ME303', credits: 3, department: 'ME', description: 'Casting, welding, machining processes, CNC, and additive manufacturing.', schedule: 'Tue/Thu 2:00-3:30', totalSlots: 45 },
    { title: 'Robotics', code: 'ME401', credits: 3, department: 'ME', description: 'Robot kinematics, dynamics, sensors, actuators, and autonomous systems.', schedule: 'Fri 10:00-1:00', totalSlots: 35 },

    // Civil Engineering
    { title: 'Structural Analysis', code: 'CE201', credits: 4, department: 'CE', description: 'Analysis of statically determinate and indeterminate structures, matrix methods.', schedule: 'Mon/Wed/Fri 10:00-11:00', totalSlots: 55 },
    { title: 'Geotechnical Engineering', code: 'CE301', credits: 3, department: 'CE', description: 'Soil mechanics, foundation engineering, earth retaining structures, and slope stability.', schedule: 'Tue/Thu 11:00-12:30', totalSlots: 45 },
    { title: 'Transportation Engineering', code: 'CE302', credits: 3, department: 'CE', description: 'Highway design, traffic engineering, pavement design, and urban transportation.', schedule: 'Mon/Wed 2:00-3:30', totalSlots: 50 },
    { title: 'Environmental Engineering', code: 'CE303', credits: 3, department: 'CE', description: 'Water treatment, wastewater management, air pollution control, and solid waste management.', schedule: 'Tue/Thu 9:00-10:30', totalSlots: 50 },

    // Electrical Engineering
    { title: 'Power Systems', code: 'EE201', credits: 4, department: 'EE', description: 'Generation, transmission, and distribution of electrical power. Load flow and fault analysis.', schedule: 'Mon/Wed/Fri 9:00-10:00', totalSlots: 50 },
    { title: 'Control Systems', code: 'EE301', credits: 3, department: 'EE', description: 'Feedback systems, stability analysis, root locus, Bode plots, and state-space methods.', schedule: 'Tue/Thu 10:00-11:30', totalSlots: 45 },
    { title: 'Electrical Machines', code: 'EE302', credits: 3, department: 'EE', description: 'DC machines, transformers, induction motors, synchronous machines, and special machines.', schedule: 'Mon/Wed 11:00-12:30', totalSlots: 50 },

    // Information Technology
    { title: 'Data Mining & Warehousing', code: 'IT301', credits: 3, department: 'IT', description: 'Data preprocessing, classification, clustering, association rules, and data warehouse design.', schedule: 'Tue/Thu 2:00-3:30', totalSlots: 40 },
    { title: 'Mobile App Development', code: 'IT302', credits: 3, department: 'IT', description: 'Android and iOS app development, React Native, Flutter, and mobile UI/UX design.', schedule: 'Mon/Wed 9:00-10:30', totalSlots: 40 },
    { title: 'DevOps & CI/CD', code: 'IT401', credits: 3, department: 'IT', description: 'Git, Docker, Kubernetes, Jenkins, CI/CD pipelines, and infrastructure as code.', schedule: 'Fri 2:00-5:00', totalSlots: 35 },

    // Common / General
    { title: 'Engineering Mathematics III', code: 'MA201', credits: 4, department: 'CS', description: 'Linear algebra, differential equations, Laplace transforms, and complex analysis.', schedule: 'Mon/Wed/Fri 8:00-9:00', totalSlots: 80 },
    { title: 'Discrete Mathematics', code: 'MA202', credits: 3, department: 'CS', description: 'Logic, sets, relations, functions, graph theory, combinatorics, and number theory.', schedule: 'Tue/Thu 8:00-9:30', totalSlots: 70 },
    { title: 'Probability & Statistics', code: 'MA301', credits: 3, department: 'CS', description: 'Probability theory, random variables, distributions, hypothesis testing, and regression analysis.', schedule: 'Mon/Wed 3:30-5:00', totalSlots: 70 },
];

async function seedCourses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check existing courses
        const existingCount = await Course.countDocuments();
        console.log(`Found ${existingCount} existing courses`);

        let added = 0;
        for (const courseData of courses) {
            const exists = await Course.findOne({ code: courseData.code });
            if (!exists) {
                await new Course({ ...courseData, isActive: true, enrolledCount: 0 }).save();
                added++;
                console.log(`  ✓ Added: ${courseData.code} - ${courseData.title}`);
            } else {
                console.log(`  ⏭ Skipped (exists): ${courseData.code} - ${courseData.title}`);
            }
        }

        console.log(`\nDone! Added ${added} new courses. Total: ${existingCount + added}`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding courses:', err);
        process.exit(1);
    }
}

seedCourses();
