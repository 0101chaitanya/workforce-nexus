const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the backend .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const Company = require('../src/models/Company');
const User = require('../src/models/User');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const Payroll = require('../src/models/Payroll');

const generateData = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in backend/.env file');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await Company.deleteMany({});
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});
    console.log('Database collections cleared successfully.');

    // 1. Create Company
    const company = await Company.create({
      companyName: 'Acme Corporation',
      email: 'contact@acme.com',
      isVerified: true,
      address: '123 Tech Blvd, Silicon Valley, CA',
      phone: '+1 (555) 019-2834',
    });
    console.log('Created Company:', company.companyName);

    // 2. Create Owner User
    const owner = await User.create({
      fullName: 'Chaitanya Owner',
      email: '0101chaitanya@gmail.com',
      password: 'Password@123', // Mongoose pre-save hook will hash this
      role: 'owner',
      isVerified: true,
      company: company._id,
      position: 'Chief Executive Officer',
      branch: 'HQ',
      dateOfBirth: new Date('1985-05-15'),
      phone: '+1 (555) 111-2222',
      address: '456 Executive Way, San Francisco, CA',
      bankAccount: 'US1234567890',
    });
    console.log('Created Owner User:', owner.email);

    // Link Company to the Owner
    company.owner = owner._id;
    await company.save();
    console.log('Linked Company to Owner.');

    // 3. Create Employee Users
    const employeesData = [
      {
        fullName: 'John Doe',
        email: 'ololchaitanya@outlook.com',
        password: 'Password@123',
        role: 'employee',
        isVerified: true,
        company: company._id,
        position: 'Software Developer',
        branch: 'HQ',
        salary: 80000,
        dateOfBirth: new Date('1992-08-20'),
        joinDate: new Date('2024-01-15'),
        phone: '+1 (555) 222-3333',
        address: '789 Coder Lane, San Jose, CA',
        bankAccount: 'US0987654321',
      },
      {
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'employee',
        isVerified: true,
        company: company._id,
        position: 'Product Manager',
        branch: 'HQ',
        salary: 95000,
        dateOfBirth: new Date('1990-03-12'),
        joinDate: new Date('2023-06-01'),
        phone: '+1 (555) 333-4444',
        address: '101 PM Rd, Oakland, CA',
        bankAccount: 'US1122334455',
      },
      {
        fullName: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: 'password123',
        role: 'employee',
        isVerified: true,
        company: company._id,
        position: 'UX Designer',
        branch: 'Branch A',
        salary: 75000,
        dateOfBirth: new Date('1995-11-05'),
        joinDate: new Date('2024-03-10'),
        phone: '+1 (555) 444-5555',
        address: '202 Creative Ave, Berkeley, CA',
        bankAccount: 'US5544332211',
      },
      {
        fullName: 'Alice Williams',
        email: 'alice.williams@example.com',
        password: 'password123',
        role: 'employee',
        isVerified: true,
        company: company._id,
        position: 'HR Manager',
        branch: 'HQ',
        salary: 85000,
        dateOfBirth: new Date('1988-07-22'),
        joinDate: new Date('2022-11-01'),
        phone: '+1 (555) 555-6666',
        address: '303 HR Street, San Francisco, CA',
        bankAccount: 'US6677889900',
      },
      {
        fullName: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        password: 'password123',
        role: 'employee',
        isVerified: true,
        company: company._id,
        position: 'QA Engineer',
        branch: 'Branch A',
        salary: 70000,
        dateOfBirth: new Date('1997-04-18'),
        joinDate: new Date('2024-05-01'),
        phone: '+1 (555) 666-7777',
        address: '404 Test Blvd, Palo Alto, CA',
        bankAccount: 'US9988776655',
      }
    ];

    const employees = [];
    for (const data of employeesData) {
      const employee = await User.create(data);
      employees.push(employee);
      console.log(`Created Employee User: ${employee.fullName} (${employee.email})`);
    }

    // 4. Create Leave Records
    const leavesData = [
      {
        user: employees[0]._id, // John Doe
        company: company._id,
        type: 'sick',
        startDate: new Date('2026-05-10'),
        endDate: new Date('2026-05-11'),
        reason: 'Severe fever and doctor advised rest',
        status: 'approved',
        remarks: 'Approved. Get well soon.',
      },
      {
        user: employees[0]._id, // John Doe
        company: company._id,
        type: 'unpaid',
        startDate: new Date('2026-04-12'),
        endDate: new Date('2026-04-15'),
        reason: 'Personal urgent family work out of state',
        status: 'approved',
        remarks: 'Approved as unpaid leave.',
      },
      {
        user: employees[1]._id, // Jane Smith
        company: company._id,
        type: 'annual',
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-20'),
        reason: 'Summer vacation',
        status: 'pending',
      },
      {
        user: employees[2]._id, // Bob Johnson
        company: company._id,
        type: 'personal',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-02'),
        reason: 'Personal errands',
        status: 'rejected',
        remarks: 'Too busy this week, please reschedule.',
      }
    ];

    for (const data of leavesData) {
      await Leave.create(data);
    }
    console.log(`Created ${leavesData.length} Leave records.`);

    // 5. Create Payroll Records for past 3 months (Feb, Mar, Apr 2026)
    const currentYear = 2026;
    const payrollMonths = [2, 3, 4]; // Feb, Mar, Apr
    let payrollCount = 0;

    for (const month of payrollMonths) {
      const daysInMonth = new Date(currentYear, month, 0).getDate();
      for (const emp of employees) {
        const grossSalary = emp.salary || 60000;
        const monthlySalary = Math.round(grossSalary / 12);
        
        let unpaidDays = 0;
        // John Doe had 4 days of unpaid leave in April
        if (emp.email === 'ololchaitanya@outlook.com' && month === 4) {
          unpaidDays = 4;
        }

        const dailyWage = monthlySalary / daysInMonth;
        const deductions = Math.round(unpaidDays * dailyWage);
        const basicPay = Math.max(0, monthlySalary - deductions);
        const taxes = Math.round(basicPay * 0.15); // 15% estimated taxes
        const netPay = basicPay - taxes;

        await Payroll.create({
          user: emp._id,
          company: company._id,
          month,
          year: currentYear,
          basicPay,
          taxes,
          netPay,
          paidDate: new Date(currentYear, month - 1, 28),
          status: 'generated'
        });
        payrollCount++;
      }
    }
    console.log(`Created ${payrollCount} Payroll records.`);

    // 6. Create Attendance records for all employees (Last 30 weekdays)
    console.log('Generating attendance records for the last 30 days...');
    let attendanceCount = 0;
    const today = new Date();
    
    for (let i = 35; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Skip weekends (Saturday=6, Sunday=0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const emp of employees) {
        // Set date hours to midnight for consistency
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if employee has an approved leave on this day
        const onLeave = leavesData.some(l => 
          l.user.toString() === emp._id.toString() &&
          l.status === 'approved' &&
          attendanceDate >= new Date(l.startDate).setHours(0,0,0,0) &&
          attendanceDate <= new Date(l.endDate).setHours(0,0,0,0)
        );

        let status = 'present';
        let checkInTime = null;
        let checkOutTime = null;
        let totalHours = 0;

        if (onLeave) {
          status = 'leave';
        } else {
          // 88% chance present, 7% chance half-day, 5% chance absent
          const rand = Math.random();
          if (rand < 0.05) {
            status = 'absent';
          } else if (rand < 0.12) {
            status = 'half-day';
            // Half day: 4 hours
            checkInTime = new Date(date);
            checkInTime.setHours(9, 0, 0, 0); // 9:00 AM
            checkOutTime = new Date(date);
            checkOutTime.setHours(13, 0, 0, 0); // 1:00 PM
            totalHours = 4;
          } else {
            status = 'present';
            // Normal present day: 8 hours +- random mins
            checkInTime = new Date(date);
            // Check in between 8:45 AM and 9:15 AM
            checkInTime.setHours(8, 45 + Math.floor(Math.random() * 30), 0, 0);
            
            checkOutTime = new Date(date);
            // Check out between 5:00 PM and 5:30 PM
            checkOutTime.setHours(17, Math.floor(Math.random() * 30), 0, 0);

            const diffMs = checkOutTime - checkInTime;
            totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
          }
        }

        await Attendance.create({
          user: emp._id,
          company: company._id,
          date: attendanceDate,
          checkInTime,
          checkOutTime,
          status,
          totalHours,
          remarks: status === 'leave' ? 'On Approved Leave' : status === 'absent' ? 'Unexcused Absence' : 'Regular day'
        });
        attendanceCount++;
      }
    }
    console.log(`Created ${attendanceCount} Attendance records.`);

    console.log('\n=============================================');
    console.log('Dummy data generated successfully!');
    console.log('---------------------------------------------');
    console.log('--- TEST CREDENTIALS ---');
    console.log('Owner Login:    0101chaitanya@gmail.com / Password@123');
    console.log('Employee Login: ololchaitanya@outlook.com / Password@123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Error during data generation:', err);
    process.exit(1);
  }
};

generateData();
