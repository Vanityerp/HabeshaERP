const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const staffData = [
  { employeeNumber: '9100', nickname: 'Tsedey', fullName: 'Tsedey Asefa', email: 'Tsedey@habeshasalon.com', phone: '77798124', role: 'Manager', dateOfBirth: '1986-05-10', homeService: true, qidNumber: '28623000532', passportNumber: 'ep6252678', qidValidity: '01-12-25', passportValidity: '22-11-25', medicalValidity: '01-01-26' },
  { employeeNumber: '9101', nickname: 'Mekdes', fullName: 'Mekdes Bekele', email: 'mekdes@habeshasalon.com', phone: '33481527', role: 'Stylist', dateOfBirth: '1986-02-23', homeService: true, qidNumber: '28623003433', passportNumber: 'EP7832122', qidValidity: '01-12-25', passportValidity: '24-05-28', medicalValidity: '01-01-26' },
  { employeeNumber: '9102', nickname: 'Aster', fullName: 'Aster Tarekegn', email: 'aster@habeshasalon.com', phone: '66868083', role: 'Stylist', dateOfBirth: '1990-09-04', homeService: true, qidNumber: '29023002985', passportNumber: 'EP6586158', qidValidity: '26-08-26', passportValidity: '13-07-26', medicalValidity: '01-01-26' },
  { employeeNumber: '9103', nickname: 'Gelila', fullName: 'Gelila Asrat', email: 'gelila@habeshasalon.com', phone: '51101385', role: 'Nail Artist', dateOfBirth: '2000-01-28', homeService: true, qidNumber: '30023001427', passportNumber: 'EQ2036945', qidValidity: '07-05-26', passportValidity: '17-02-30', medicalValidity: '01-01-26' },
  { employeeNumber: '9104', nickname: 'Samri', fullName: 'Samrawit Tufa', email: 'samri@habeshasalon.com', phone: '50579597', role: 'Nail Artist', dateOfBirth: '1994-08-07', homeService: true, qidNumber: '29423002678', passportNumber: 'EP6949093', qidValidity: '21-01-26', passportValidity: '08-03-27', medicalValidity: '01-01-26' },
  { employeeNumber: '9105', nickname: 'Vida', fullName: 'Vida Agbali', email: 'Vida@habeshasalon.com', phone: '31407033', role: 'Stylist', dateOfBirth: '1992-10-25', homeService: true, qidNumber: '29228801597', passportNumber: 'G2323959', qidValidity: '21-04-26', passportValidity: '21-01-31', medicalValidity: '01-01-26' },
  { employeeNumber: '9106', nickname: 'Genet', fullName: 'Genet Yifru', email: 'genet@habeshasalon.com', phone: '50085617', role: 'Pedecurist', dateOfBirth: '1980-07-19', homeService: true, qidNumber: '28023003513', passportNumber: 'EP7405867', qidValidity: '25-02-26', passportValidity: '13-12-27', medicalValidity: '01-01-26' },
  { employeeNumber: '9107', nickname: 'Woyni', fullName: 'Woynshet Tilahun', email: 'Woyni@habeshasalon.com', phone: '33378522', role: 'Stylist', dateOfBirth: '1987-07-12', homeService: true, qidNumber: '28723005500', passportNumber: 'EP', qidValidity: '17-09-25', passportValidity: '20-10-27', medicalValidity: '01-01-26' },
  { employeeNumber: '9108', nickname: 'Habtam', fullName: 'Habtamua Wana', email: 'habtam@habeshasalon.com', phone: '59996537', role: 'Stylist', dateOfBirth: '1989-09-20', homeService: true, qidNumber: '28923005645', passportNumber: 'EP6217793', qidValidity: '25-02-26', passportValidity: '18-10-25', medicalValidity: '01-01-26' },
  { employeeNumber: '9109', nickname: 'Jeri', fullName: 'Yerusalem Hameso', email: 'Jeri@habeshasalon.com', phone: '70365925', role: 'Stylist', dateOfBirth: '1990-10-20', homeService: true, qidNumber: '29023004807', passportNumber: 'EP8743913', qidValidity: '09-07-25', passportValidity: '17-03-29', medicalValidity: '01-01-26' },
  { employeeNumber: '9110', nickname: 'Beti-Mk', fullName: 'Bethlehem', email: 'beti@habeshasalon.com', phone: '66830977', role: 'Stylist', dateOfBirth: null, homeService: true, qidNumber: null, passportNumber: null, qidValidity: null, passportValidity: null, medicalValidity: '01-01-26' },
  { employeeNumber: '9111', nickname: 'Ruth', fullName: 'Haymanot Tadesse', email: 'Ruth@habeshasalon.com', phone: '50227010', role: 'Beautician', dateOfBirth: '1989-07-18', homeService: false, qidNumber: '28923005561', passportNumber: 'EP6757286', qidValidity: '28-02-26', passportValidity: '22-10-26', medicalValidity: '01-01-26' },
  { employeeNumber: '9112', nickname: 'Elsa', fullName: 'Elsabeth Melaku', email: 'Elsa@habeshasalon.com', phone: '50104456', role: 'Stylist and Nail technician', dateOfBirth: '1979-11-10', homeService: false, qidNumber: '27923002347', passportNumber: 'EP7085203', qidValidity: '11-07-27', passportValidity: '19-06-27', medicalValidity: '01-01-26' },
  { employeeNumber: '9113', nickname: 'Titi', fullName: 'Tirhas Leakemaryam', email: 'Titi@habeshasalon.com', phone: '59991432', role: 'Stylist', dateOfBirth: '1987-10-09', homeService: true, qidNumber: '28723007773', passportNumber: 'EP6197364', qidValidity: '13-03-26', passportValidity: '19-08-25', medicalValidity: '01-01-26' },
  { employeeNumber: '9114', nickname: 'Yenu', fullName: 'Etifwork Aschalew', email: 'Yenu@habeshasalon.com', phone: '30614686', role: 'Beautician', dateOfBirth: '1980-02-22', homeService: false, qidNumber: '28023003515', passportNumber: 'EP7979493', qidValidity: '14-05-26', passportValidity: '01-04-28', medicalValidity: '01-01-26' },
  { employeeNumber: '9115', nickname: 'Frie', fullName: 'Frehiwot Bahru', email: 'frie@habeshasalon.com', phone: '51179966', role: 'Beautician', dateOfBirth: '1991-01-29', homeService: true, qidNumber: '29123003741', passportNumber: 'EP7212333', qidValidity: '15-01-26', passportValidity: '17-07-27', medicalValidity: '01-01-26' },
  { employeeNumber: '9116', nickname: 'Zed', fullName: 'Zewdu Teklay', email: 'zed@habeshasalon.com', phone: '50764570', role: 'Stylist', dateOfBirth: '1995-05-16', homeService: true, qidNumber: '29523002064', passportNumber: 'EP8133993', qidValidity: '12-10-25', passportValidity: '07-10-28', medicalValidity: '01-01-26' },
  { employeeNumber: '9117', nickname: 'Beti', fullName: 'Zufan Thomas', email: 'beti@habeshasalon.com', phone: '30732501', role: 'Stylist', dateOfBirth: '1991-09-12', homeService: true, qidNumber: '29123002832', passportNumber: 'EP6689476', qidValidity: '02-05-26', passportValidity: '13-09-26', medicalValidity: '01-01-26' },
  { employeeNumber: '9118', nickname: 'Maya', fullName: 'Hintsa Gebrezgi', email: 'maya@habeshasalon.com', phone: '51337449', role: 'Stylist', dateOfBirth: null, homeService: true, qidNumber: '222025002506', passportNumber: null, qidValidity: null, passportValidity: null, medicalValidity: '01-01-26' },
  { employeeNumber: '9119', nickname: 'Tirhas', fullName: 'Tirhas Tajebe', email: 'tirhas@habeshasalon.com', phone: null, role: 'Nail Artist', dateOfBirth: null, homeService: true, qidNumber: '382025419997', passportNumber: null, qidValidity: null, passportValidity: null, medicalValidity: '01-01-26' },
  { employeeNumber: '9120', nickname: 'Tsigereda', fullName: 'Tsigereda Esayas', email: 'tsigereda@habeshasalon.com', phone: '55849079', role: 'Stylist', dateOfBirth: null, homeService: true, qidNumber: '382024482060', passportNumber: null, qidValidity: null, passportValidity: null, medicalValidity: '01-01-26' },
  { employeeNumber: '9121', nickname: 'Shalom', fullName: 'Siyamili Kuna', email: 'shalom@habeshasalon.com', phone: '551011295', role: 'Beautician', dateOfBirth: null, homeService: true, qidNumber: '29135634320', passportNumber: null, qidValidity: null, passportValidity: null, medicalValidity: '01-01-26' },
  { employeeNumber: '9122', nickname: 'Samrawit', fullName: 'Samrawit Legese', email: 'samrawit@habeshasalon.com', phone: '33462505', role: 'Sales', dateOfBirth: null, homeService: true, qidNumber: null, passportNumber: null, qidValidity: null, passportValidity: null, medicalValidity: null },
]

async function importStaff() {
  console.log('Starting staff import with nicknames...')
  
  let created = 0
  let updated = 0
  let errors = 0

  for (const staff of staffData) {
    try {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: staff.email }
      })

      // Create user if doesn't exist
      if (!user) {
        const defaultPassword = await bcrypt.hash('staff123', 10)
        user = await prisma.user.create({
          data: {
            email: staff.email,
            password: defaultPassword,
            role: 'STAFF',
            isActive: true
          }
        })
        console.log(`✅ Created user for ${staff.nickname}`)
      }

      // Check if staff profile exists
      const existingStaff = await prisma.staffMember.findUnique({
        where: { userId: user.id }
      })

      const staffData = {
        name: staff.fullName,
        nickname: staff.nickname,
        phone: staff.phone,
        employeeNumber: staff.employeeNumber,
        jobRole: staff.role,
        dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth) : null,
        homeService: staff.homeService,
        status: 'ACTIVE',
        qidNumber: staff.qidNumber,
        passportNumber: staff.passportNumber,
        qidValidity: staff.qidValidity,
        passportValidity: staff.passportValidity,
        medicalValidity: staff.medicalValidity
      }

      if (existingStaff) {
        // Update existing staff
        await prisma.staffMember.update({
          where: { id: existingStaff.id },
          data: staffData
        })
        console.log(`✅ Updated ${staff.nickname} (${staff.fullName})`)
        updated++
      } else {
        // Create new staff
        await prisma.staffMember.create({
          data: {
            ...staffData,
            userId: user.id
          }
        })
        console.log(`✅ Created ${staff.nickname} (${staff.fullName})`)
        created++
      }
    } catch (error) {
      console.error(`❌ Error processing ${staff.nickname}:`, error.message)
      errors++
    }
  }

  console.log(`\n📊 Import Summary:`)
  console.log(`   Created: ${created}`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Errors: ${errors}`)
  console.log(`   Total: ${staffData.length}`)
}

importStaff()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
