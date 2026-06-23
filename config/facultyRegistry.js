/**
 * Approved Faculty Registry
 * 
 * Only faculty members whose Faculty ID appears in this list
 * can sign up through the portal. This prevents unauthorized
 * users from registering as faculty.
 * 
 * To add a new faculty member:
 *   1. Add their Faculty ID, name, and department below
 *   2. Share the Faculty ID with them so they can use it during signup
 *   3. Restart the server
 */

const approvedFaculty = [
    { facultyId: 'FAC1001', name: 'Dr. Rajesh Kumar', department: 'CS', email: null },
    { facultyId: 'FAC1002', name: 'Dr. Priya Sharma', department: 'CS', email: null },
    { facultyId: 'FAC1003', name: 'Dr. Amit Patel', department: 'EC', email: null },
    { facultyId: 'FAC1004', name: 'Dr. Sneha Reddy', department: 'ME', email: null },
    { facultyId: 'FAC1005', name: 'Dr. Vikram Singh', department: 'CE', email: null },
    { facultyId: 'FAC1006', name: 'Dr. Anita Deshmukh', department: 'EE', email: null },
    { facultyId: 'FAC1007', name: 'Dr. Suresh Nair', department: 'IT', email: null },
    { facultyId: 'FAC1008', name: 'Dr. Kavita Rao', department: 'CS', email: null },
    { facultyId: 'FAC1009', name: 'Dr. Manoj Gupta', department: 'EC', email: null },
    { facultyId: 'FAC1010', name: 'Dr. Ritu Verma', department: 'BT', email: null },
    { facultyId: 'FAC1011', name: 'Dr. Deepak Joshi', department: 'CH', email: null },
    { facultyId: 'FAC1012', name: 'Dr. Meera Iyer', department: 'ME', email: null },
];

/**
 * Validate a faculty ID.
 * Returns the faculty record if valid, null otherwise.
 */
function validateFacultyId(facultyId) {
    if (!facultyId) return null;
    const id = facultyId.trim().toUpperCase();
    return approvedFaculty.find(f => f.facultyId === id) || null;
}

/**
 * Check if a faculty ID has already been used for signup.
 * Call this after checking the registry to prevent duplicate signups.
 */
function isFacultyIdUsed(facultyId, existingUsers) {
    // This is checked against the DB in the controller
    return false;
}

module.exports = {
    approvedFaculty,
    validateFacultyId
};
