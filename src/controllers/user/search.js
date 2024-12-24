const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment-timezone");

const searchFlights = async (req, res, next) => {
  try {
    const {
      departureAirportCode,
      arrivalAirportCode,
      departureTime,
      seatClasses,
      adultPassenger,
      childPassenger,
      babyPassenger,
      page = 1,
      pageSize = 10,
    } = req.query;

    if (
      !departureAirportCode ||
      !arrivalAirportCode ||
      !departureTime ||
      !seatClasses ||
      !adultPassenger ||
      !childPassenger ||
      !babyPassenger
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (
      typeof departureAirportCode !== "string" ||
      typeof arrivalAirportCode !== "string" ||
      typeof seatClasses !== "string" ||
      isNaN(adultPassenger) ||
      isNaN(childPassenger) ||
      isNaN(babyPassenger)
    ) {
      return res.status(400).json({
        message: "Invalid input data",
      });
    }

    const departureAirportCodeLower = departureAirportCode.toLowerCase();
    const arrivalAirportCodeLower = arrivalAirportCode.toLowerCase();
    const seatClassesLower = seatClasses.toLowerCase();
    const totalPassengers =
      parseInt(adultPassenger) +
      parseInt(childPassenger) +
      parseInt(babyPassenger);

    if (departureAirportCodeLower === arrivalAirportCodeLower) {
      return res.status(400).json({
        message: "Departure and arrival airport cannot be the same",
      });
    }

    const isValidDate = moment(departureTime, "YYYY-MM-DD", true).isValid();
    if (!isValidDate) {
      return res.status(400).json({
        message: "Invalid date format or non-existent date",
      });
    }

    const parsedDate = new Date(departureTime);
    if (isNaN(parsedDate)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    const departureAirport = await prisma.airports.findMany({
      where: {
        airportCode: {
          equals: departureAirportCodeLower,
          mode: "insensitive",
        },
      },
    });

    if (!departureAirport || departureAirport.length === 0) {
      return res.status(404).json({
        message: "Airport not found",
      });
    }

    const arrivalAirport = await prisma.airports.findMany({
      where: {
        airportCode: {
          equals: arrivalAirportCodeLower,
          mode: "insensitive",
        },
      },
    });

    if (!arrivalAirport || arrivalAirport.length === 0) {
      return res.status(404).json({
        message: "Airport not found",
      });
    }

    const existingRoute = await prisma.routes.findMany({
      where: {
        departureAirportId: departureAirport[0].id,
        arrivalAirportId: arrivalAirport[0].id,
      },
    });

    // console.log("Departure Airport ID:", departureAirport[0].id);
    // console.log("Arrival Airport ID:", arrivalAirport[0].id);
    // console.log("Existing route:", existingRoute);

    if (!existingRoute || existingRoute.length === 0) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(pageSize);
    const offset = (pageNumber - 1) * itemsPerPage;
    const flights = await prisma.flights.findMany({
      where: {
        route: {
          departureAirport: departureAirport.id,
          arrivalAirport: arrivalAirport.id,
          seatClass: {
            name: {
              equals: seatClassesLower,
              mode: "insensitive",
            },
          },
        },
        departureTime: {
          gte: new Date(parsedDate.setHours(0, 0, 0)),
          lt: new Date(parsedDate.setHours(23, 59, 59)),
        },
      },
      include: {
        route: {
          include: {
            seatClass: true,
          },
        },
        plane: {
          include: {
            seats: true,
          },
        },
      },
      skip: offset,
      take: itemsPerPage,
    });

    const availableFlights = flights.filter((flight) => {
      const availableSeats = flight.plane.seats.filter(
        (seat) => seat.isAvailable
      ).length;
      return availableSeats >= parseInt(totalPassengers);
    });

    if (availableFlights.length === 0) {
      return res.status(404).json({
        message: "No flights available for the given criteria",
      });
    }

    const availableFlightsResponse = availableFlights.map((flight) => {
      const timeZone = "Asia/Jakarta";
      const departureTimeConvert = moment
        .utc(flight.departureTime)
        .tz(timeZone)
        .format("YYYY-MM-DD HH:mm:ss");
      const arrivalTimeConvert = moment
        .utc(flight.arrivalTime)
        .tz(timeZone)
        .format("YYYY-MM-DD HH:mm:ss");

      const convertDepartureTimeToDate = new Date(departureTimeConvert);
      const convertArrivalTimeToDate = new Date(arrivalTimeConvert);
      return {
        flightId: flight.id,
        departureAirport: departureAirportCode,
        arrivalAirport: arrivalAirportCode,
        departureTime: convertDepartureTimeToDate.toLocaleTimeString(),
        departureDate: convertDepartureTimeToDate.toLocaleDateString(),
        arrivalTime: convertArrivalTimeToDate.toLocaleTimeString(),
        arrivalDate: convertArrivalTimeToDate.toLocaleDateString(),
        flightCode: flight.flightCode,
        duration: flight.duration,
        route: {
          routeId: flight.route.id,
          departureAirport: departureAirportCode,
          arrivalAirport: arrivalAirportCode,
          seatClass: seatClasses,
        },
        plane: {
          planeId: flight.plane.id,
          planeName: flight.plane.name,
          planeCode: flight.plane.planeCode,
          description: flight.plane.description,
          baggage: flight.plane.baggage,
          cabinBaggage: flight.plane.cabinBaggage,
        },
        price: flight.route.seatClass.priceAdult,
      };
    });

    const totalFlights = await prisma.flights.count({
      where: {
        route: {
          departureAirportId: departureAirport.id,
          arrivalAirportId: arrivalAirport.id,
          seatClass: { name: seatClasses },
        },
        departureTime: {
          gte: new Date(parsedDate.setHours(0, 0, 0)),
          lt: new Date(parsedDate.setHours(23, 59, 59)),
        },
      },
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Flights retrieved successfully",
      totalPages: Math.ceil(totalFlights / itemsPerPage),
      page: pageNumber,
      totalFlights: totalFlights,
      flights: availableFlightsResponse,
    });
  } catch (error) {
    next(error);
  }
};

const returnSearchFlights = async (req, res, next) => {
  try {
    const {
      departureAirportCode,
      arrivalAirportCode,
      returnTime,
      seatClasses,
      adultPassenger,
      childPassenger,
      babyPassenger,
      page = 1,
      pageSize = 10,
    } = req.query;

    if (
      !departureAirportCode ||
      !arrivalAirportCode ||
      !returnTime ||
      !seatClasses ||
      !adultPassenger ||
      !childPassenger ||
      !babyPassenger
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
      // const error = new Error("Please provide all required fields");
      // error.status = 400;
      // throw error;
    }

    if (
      typeof departureAirportCode !== "string" ||
      typeof arrivalAirportCode !== "string" ||
      typeof seatClasses !== "string" ||
      isNaN(adultPassenger) ||
      isNaN(childPassenger) ||
      isNaN(babyPassenger)
    ) {
      return res.status(400).json({
        message: "Invalid input data",
      });
      // const error = new Error("Invalid input data");
      // error.status = 400;
      // throw error;
    }

    const departureAirportCodeLower = departureAirportCode.toLowerCase();
    const arrivalAirportCodeLower = arrivalAirportCode.toLowerCase();
    const seatClassesLower = seatClasses.toLowerCase();
    const totalPassengers =
      parseInt(adultPassenger) +
      parseInt(childPassenger) +
      parseInt(babyPassenger);

    if (departureAirportCodeLower === arrivalAirportCodeLower) {
      return res.status(400).json({
        message: "Departure and arrival airport cannot be the same",
      });
      // const error = new Error(
      //   "Departure and arrival airport cannot be the same"
      // );
      // error.status = 400;
      // throw error;
    }

    const isValidReturnDate = moment(returnTime, "YYYY-MM-DD", true).isValid();
    if (!isValidReturnDate) {
      return res.status(400).json({
        message: "Invalid return date format or non-existent date",
      });
      // const error = new Error(
      //   "Invalid return date format or non-existent date"
      // );
      // error.statusCode = 400;
      // throw error;
    }

    const parsedReturnDate = new Date(returnTime);
    if (isNaN(parsedReturnDate)) {
      return res.status(400).json({
        message: "Invalid return date format",
      });
      // const error = new Error("Invalid return date format");
      // error.statusCode = 400;
      // throw error;
    }

    const arrivalAirport = await prisma.airports.findMany({
      where: {
        airportCode: {
          equals: arrivalAirportCodeLower,
          mode: "insensitive",
        },
      },
    });

    if (!arrivalAirport || arrivalAirport.length === 0) {
      return res.status(404).json({
        message: "Airport not found",
      });
      // const error = new Error("Airport not found");
      // error.status = 404;
      // throw error;
    }

    const departureAirport = await prisma.airports.findMany({
      where: {
        airportCode: {
          equals: departureAirportCodeLower,
          mode: "insensitive",
        },
      },
    });

    if (!departureAirport || departureAirport.length === 0) {
      return res.status(404).json({
        message: "Airport not found",
      });
      // const error = new Error("Airport not found");
      // error.status = 404;
      // throw error;
    }

    const returnRoute = await prisma.routes.findMany({
      where: {
        departureAirportId: arrivalAirport[0].id,
        arrivalAirportId: departureAirport[0].id,
      },
    });
    if (!returnRoute || returnRoute.length === 0) {
      return res.status(404).json({
        message: "Return route not found",
      });
      // const error = new Error("Return route not found");
      // error.statusCode = 404;
      // throw error;
    }

    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(pageSize);
    const offset = (pageNumber - 1) * itemsPerPage;
    const returnFlights = await prisma.flights.findMany({
      where: {
        route: {
          departureAirportId: arrivalAirport[0].id,
          arrivalAirportId: departureAirport[0].id,
          seatClass: {
            name: {
              equals: seatClassesLower,
              mode: "insensitive",
            },
          },
        },
        departureTime: {
          gte: new Date(parsedReturnDate.setHours(0, 0, 0)),
          lt: new Date(parsedReturnDate.setHours(23, 59, 59)),
        },
      },
      include: {
        route: {
          include: {
            seatClass: true,
          },
        },
        plane: {
          include: {
            seats: true,
          },
        },
      },
      skip: offset,
      take: itemsPerPage,
    });

    const availableReturnFlights = returnFlights.filter((flight) => {
      const availableSeats = flight.plane.seats.filter(
        (seat) => seat.isAvailable
      ).length;
      return availableSeats >= parseInt(totalPassengers);
    });

    if (availableReturnFlights.length === 0) {
      return res.status(404).json({
        message: "No return flights available for the given criteria",
      });
      // const error = new Error(
      //   "No return flights available for the given criteria"
      // );
      // error.status = 404;
      // throw error;
    }

    const availableReturnFlightsResponse = availableReturnFlights.map(
      (flight) => {
        const timeZone = "Asia/Jakarta";
        const departureTimeConvert = moment
          .utc(flight.departureTime)
          .tz(timeZone)
          .format("YYYY-MM-DD HH:mm:ss");
        const arrivalTimeConvert = moment
          .utc(flight.arrivalTime)
          .tz(timeZone)
          .format("YYYY-MM-DD HH:mm:ss");

        const convertDepartureTimeToDate = new Date(departureTimeConvert);
        const convertArrivalTimeToDate = new Date(arrivalTimeConvert);
        return {
          flightId: flight.id,
          departureAirport: arrivalAirportCode,
          arrivalAirport: departureAirportCode,
          departureTime: convertDepartureTimeToDate.toLocaleTimeString(),
          departureDate: convertDepartureTimeToDate.toLocaleDateString(),
          arrivalTime: convertArrivalTimeToDate.toLocaleTimeString(),
          arrivalDate: convertArrivalTimeToDate.toLocaleDateString(),
          flightCode: flight.flightCode,
          duration: flight.duration,
          route: {
            routeId: flight.route.id,
            departureAirport: arrivalAirportCode,
            arrivalAirport: departureAirportCode,
            seatClass: seatClasses,
          },
          plane: {
            planeId: flight.plane.id,
            planeName: flight.plane.name,
            planeCode: flight.plane.planeCode,
            description: flight.plane.description,
            baggage: flight.plane.baggage,
            cabinBaggage: flight.plane.cabinBaggage,
          },
          price: flight.route.seatClass.priceAdult,
        };
      }
    );

    const totalReturnFlights = await prisma.flights.count({
      where: {
        route: {
          departureAirportId: arrivalAirport[0].id,
          arrivalAirportId: departureAirport[0].id,
          seatClass: { name: seatClasses },
        },
        departureTime: {
          gte: new Date(parsedReturnDate.setHours(0, 0, 0)),
          lt: new Date(parsedReturnDate.setHours(23, 59, 59)),
        },
      },
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Return flights retrieved successfully",
      totalPages: Math.ceil(totalReturnFlights / itemsPerPage),
      page: pageNumber,
      totalReturnFlights: totalReturnFlights,
      flights: availableReturnFlightsResponse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchFlights, returnSearchFlights };
