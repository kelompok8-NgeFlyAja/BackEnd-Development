const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
var doc = new PDFDocument({ size: 'A4' });
const moment = require("moment-timezone");
// const fs = require('fs');

const generatePDF = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await prisma.bookings.findUnique({
            where: {
                id: Number(bookingId)
            },
            include: {
                user: true,
                passengers: true,
                flight: {
                    include: {
                        plane: true,
                        route: {
                            include: {
                                departureAirport: true,
                                arrivalAirport: true,
                                seatClass: true
                            }
                        }
                    }
                }
            }
        });

        if (!booking) {
            return res.status(404).json({
                status: "error",
                message: "Booking not found"
            });
        }
        const timeZone = "Asia/Jakarta";
        const departureTimeConvert = moment
            .utc(booking.flight.departureTime)
            .tz(timeZone)
            .format("YYYY-MM-DD HH:mm:ss");
        const arrivalTimeConvert = moment
            .utc(booking.flight.arrivalTime)
            .tz(timeZone)
            .format("YYYY-MM-DD HH:mm:ss");


        const convertDepartureTimeToDate = new Date(departureTimeConvert);
        const convertArrivalTimeToDate = new Date(arrivalTimeConvert);

        doc.pipe(res);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Booking_${booking.bookingCode}.pdf"`);

        doc.fontSize(20).text('Booking Details').font('Helvetica-Bold');
        doc.fontSize(15).text(`Booking Code: ${booking.bookingCode}`).font('Helvetica');


        doc.fillColor('black').font('Helvetica-Bold')
            .text(`${convertDepartureTimeToDate.toLocaleTimeString()}`, { align: 'left' }, 125);
        doc.fillColor('purple').font('Helvetica-Bold').text('Keberangkatan', { align: 'right', }, 125);

        doc.moveDown();

        doc.fillColor('black').font('Helvetica')
            .text(`${convertDepartureTimeToDate.toLocaleDateString()}`, { align: 'left' }, 150);

        doc.moveDown();
        doc.fillColor('black').font('Helvetica')
            .text(`${booking.flight.route.departureAirport.name}`, { align: 'left' }, 175);

        doc.moveTo(70, 200)
            .lineTo(525, 200)
            .stroke();

        doc.fillColor('black').font('Helvetica-Bold')
            .text(`${convertArrivalTimeToDate.toLocaleTimeString()}`, { align: 'left' }, 225);
        doc.fillColor('purple').font('Helvetica-Bold').text('Kedatangan', { align: 'right', }, 225);

        doc.moveDown();

        doc.fillColor('black').font('Helvetica')
            .text(`${convertArrivalTimeToDate.toLocaleDateString()}`, { align: 'left' }, 250);

        doc.moveDown();
        doc.fillColor('black').font('Helvetica')
            .text(`${booking.flight.route.arrivalAirport.name}`, { align: 'left' }, 275);


        doc.moveTo(70, 300)
            .lineTo(525, 300)
            .stroke();

        doc.moveDown();
        doc.fillColor('black').font('Helvetica-Bold')
            .text(`${booking.flight.plane.planeName} - ${booking.flight.route.seatClass.name}`, { align: 'left', indent: 20, })
            .text(`${booking.flight.plane.planeCode}`, { align: 'left', indent: 20, });

        doc.moveDown();
        doc.fillColor('black').font('Helvetica-Bold')
            .text('Informasi :', { align: 'left', indent: 20, });

        booking.passengers.forEach((passenger, index) => {
            doc.fillColor('purple').font('Helvetica-Bold')
                .text(`Penumpang ${index + 1}: ${passenger.title} ${passenger.fullName}`, { align: 'left', indent: 20, }).fillColor('black')
                .text(`ID : ${passenger.identityNumber}`, { align: 'left', indent: 20, });
        });


        doc.end();
        // console.log('PDF generated');
    } catch (error) {
        next(error);
    }
}

module.exports = { generatePDF };