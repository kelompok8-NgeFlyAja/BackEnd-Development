const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment-timezone");

const getFilteredFlights = async (req, res, next) => {
  try {
    const parseDuration = (duration) => {
      const [hours, minutes] = duration
        .split(/[hm\s]+/)
        .filter(Boolean)
        .map(Number);
      return (hours || 0) * 60 + (minutes || 0); // Konversi ke menit
    };

    const formatDuration = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    };

    const {
      page = 1,
      limit = 10,
      sortBy = "price",
      order = "asc",
    } = req.query;

    const parsePage = parseInt(page)
    const parseLimit = parseInt(limit)

    // Validasi input
    const validSortBy = ["price", "duration", "departureTime", "arrivalTime"];
    const validOrder = ["asc", "desc"];
    if (!validSortBy.includes(sortBy) || !validOrder.includes(order)) {
      return res.status(400).json({ message: "Invalid sortBy or order value" });
    }

    const skip = (parsePage - 1) * parseLimit;

    // Tentukan field untuk sorting
    const sortFieldMap = {
      price: { route: { seatClass: { priceAdult: order } } },
      duration: undefined, //karena field duration di table flights bertipe string
      departureTime: { departureTime: order },
      arrivalTime: { arrivalTime: order },
    };

    const sortField = sortFieldMap[sortBy];

    const [totalCount, flights] = await prisma.$transaction([
      prisma.flights.count(),
      prisma.flights.findMany({
        skip,
        take: parseLimit,
        ...(sortField && { orderBy: sortField }),
        include: {
          route: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
              seatClass: true,
            },
          },
        },
      }),
    ]);

    let sortedFlights = flights;

    // Jika sorting berdasarkan durasi, lakukan sorting manual
    if (sortBy === "duration") {
      sortedFlights = flights.map((flight) => {
        const durationMinutes = parseDuration(flight.duration);
        return { ...flight, durationMinutes }; // Tambahkan field durasi dalam menit
      });

      sortedFlights.sort((a, b) =>
        order === "asc"
          ? a.durationMinutes - b.durationMinutes
          : b.durationMinutes - a.durationMinutes
      );

      // Format ulang durasi ke string
      sortedFlights = sortedFlights.map((flight) => ({
        ...flight,
        duration: formatDuration(flight.durationMinutes),
      }));
    }

    return res.status(200).json({
      page: parsePage,
      limit: parseLimit,
      totalCount,
      totalPages: Math.ceil(totalCount / parseLimit),
      data: sortedFlights,
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    next(error);
  }
};

const getFilteredBaggage = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, order = "asc", baggage } = req.query;

    const parsePage = parseInt(page);
    const parseLimit = parseInt(limit);
    const skip = (parsePage - 1) * parseLimit;
    const sortOrder = order.toLowerCase();

    if (!baggage || isNaN(parseInt(baggage))) {
      const error = new Error("Baggage query must be a valid number");
      error.status = 400;
      throw error;
    }

    const baggageWeight = parseInt(baggage);

    const exactMatch = await prisma.planes.findMany({
      where: {
        baggage: baggageWeight,
      },
      skip,
      take: parseLimit,
      orderBy: {
        baggage: sortOrder,
      },
      include: {
        flights: {
          include: {
            route: {
              include: {
                departureAirport: true,
                arrivalAirport: true,
                seatClass: true,
              },
            },
          },
        },
      },
    });

    const totalCount = exactMatch.length;

    const formattedResult = exactMatch.map((plane) => {
      const flight = plane.flights;
      const route = flight?.route;
      const timeZone = "Asia/Jakarta";
      const departureTimeConvert = flight
        ? moment.utc(flight.departureTime).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")
        : null;
      const arrivalTimeConvert = flight
        ? moment.utc(flight.arrivalTime).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")
        : null;
      const convertDepartureTimeToDate = departureTimeConvert ? new Date(departureTimeConvert) : null;
      const convertArrivalTimeToDate = arrivalTimeConvert ? new Date(arrivalTimeConvert) : null;

      return {
        planeId: plane.id,
        planeName: plane.planeName,
        baggage: plane.baggage,
        cabinBaggage: plane.cabinBaggage,
        flightDetails: flight
          ? {
              routeId: route?.id,
              promotionId: flight.promotionId,
              duration: flight.duration,
              departureTime: convertDepartureTimeToDate?.toLocaleTimeString(),
              departureDate: convertDepartureTimeToDate?.toLocaleDateString(),
              arrivalTime: convertArrivalTimeToDate?.toLocaleTimeString(),
              arrivalDate: convertArrivalTimeToDate?.toLocaleDateString(),
              flightCode: flight.flightCode,
              route: {
                id: route?.id,
                departureAirport: route?.departureAirport,
                arrivalAirport: route?.arrivalAirport,
                seatClass: route?.seatClass,
              },
              durationMinutes: flight.durationMinutes,
            }
          : null,
      };
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      page: parsePage,
      limit: parseLimit,
      totalCount,
      totalPages: Math.ceil(totalCount / parseLimit),
      data: formattedResult,
    });
  } catch (error) {
    next(error);
  }
};

const getFilteredCabinBaggage = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, order = "asc", cabinBaggage } = req.query;

    const parsePage = parseInt(page);
    const parseLimit = parseInt(limit);
    const skip = (parsePage - 1) * parseLimit;
    const sortOrder = order.toLowerCase();

    if (!cabinBaggage || isNaN(parseInt(cabinBaggage))) {
      const error = new Error("Baggage query must be a valid number");
      error.status = 400;
      throw error;
    }

    const baggageWeight = parseInt(cabinBaggage);

    const exactMatch = await prisma.planes.findMany({
      where: {
        cabinBaggage: baggageWeight,
      },
      skip,
      take: parseLimit,
      orderBy: {
        cabinBaggage: sortOrder,
      },
      include: {
        flights: {
          include: {
            route: {
              include: {
                departureAirport: true,
                arrivalAirport: true,
                seatClass: true,
              },
            },
          },
        },
      },
    });

    const totalCount = exactMatch.length;

    const formattedResult = exactMatch.map((plane) => {
      const flight = plane.flights;
      const route = flight?.route;
      const timeZone = "Asia/Jakarta";
      const departureTimeConvert = flight
        ? moment.utc(flight.departureTime).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")
        : null;
      const arrivalTimeConvert = flight
        ? moment.utc(flight.arrivalTime).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")
        : null;
      const convertDepartureTimeToDate = departureTimeConvert ? new Date(departureTimeConvert) : null;
      const convertArrivalTimeToDate = arrivalTimeConvert ? new Date(arrivalTimeConvert) : null;

      return {
        planeId: plane.id,
        planeName: plane.planeName,
        cabinBaggage: plane.cabinBaggage,
        cabinBaggage: plane.cabinBaggage,
        flightDetails: flight
          ? {
              routeId: route?.id,
              promotionId: flight.promotionId,
              duration: flight.duration,
              departureTime: convertDepartureTimeToDate?.toLocaleTimeString(),
              departureDate: convertDepartureTimeToDate?.toLocaleDateString(),
              arrivalTime: convertArrivalTimeToDate?.toLocaleTimeString(),
              arrivalDate: convertArrivalTimeToDate?.toLocaleDateString(),
              flightCode: flight.flightCode,
              route: {
                id: route?.id,
                departureAirport: route?.departureAirport,
                arrivalAirport: route?.arrivalAirport,
                seatClass: route?.seatClass,
              },
              durationMinutes: flight.durationMinutes,
            }
          : null,
      };
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      page: parsePage,
      limit: parseLimit,
      totalCount,
      totalPages: Math.ceil(totalCount / parseLimit),
      data: formattedResult,
    });
  } catch (error) {
    next(error);
  }
};

const getFilteredDesc = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, order = "asc", description } = req.query;

    const parsePage = parseInt(page);
    const parseLimit = parseInt(limit);
    const skip = (parsePage - 1) * parseLimit;

    if (!description || typeof description !== "string") {
      const error = new Error("Description query must be a valid string");
      error.status = 400;
      throw error;
    }

    const validOrders = ["asc", "desc"];
    if (!validOrders.includes(order.toLowerCase())) {
      const error = new Error("Order query must be either 'asc' or 'desc'");
      error.status = 400;
      throw error;
    }

    const sortOrder = order.toLowerCase();
    const searchDescription = description.toLowerCase(); 

    const [totalCount, exactMatch] = await prisma.$transaction([
      prisma.planes.count({
        where: {
          description: {
            contains: searchDescription,
            mode: "insensitive", 
          },
        },
      }),
      prisma.planes.findMany({
        where: {
          description: {
            contains: searchDescription, 
            mode: "insensitive", 
          },
        },
        skip,
        take: parseLimit,
        orderBy: {
          description: sortOrder,
        },
        include: {
          flights: {
            include: {
              route: {
                include: {
                  departureAirport: true,
                  arrivalAirport: true,
                  seatClass: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formattedResult = exactMatch.map((plane) => {
      const flight = plane.flights;
      const route = flight?.route;
      const timeZone = "Asia/Jakarta";
      const departureTimeConvert = flight
        ? moment.utc(flight.departureTime).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")
        : null;
      const arrivalTimeConvert = flight
        ? moment.utc(flight.arrivalTime).tz(timeZone).format("YYYY-MM-DD HH:mm:ss")
        : null;
      const convertDepartureTimeToDate = departureTimeConvert ? new Date(departureTimeConvert) : null;
      const convertArrivalTimeToDate = arrivalTimeConvert ? new Date(arrivalTimeConvert) : null;

      return {
        planeId: plane.id,
        planeName: plane.planeName,
        description: plane.description,
        baggage: plane.baggage,
        cabinBaggage: plane.cabinBaggage,
        flightDetails: flight
          ? {
              routeId: route?.id,
              promotionId: flight.promotionId,
              duration: flight.duration,
              departureTime: convertDepartureTimeToDate?.toLocaleTimeString(),
              departureDate: convertDepartureTimeToDate?.toLocaleDateString(),
              arrivalTime: convertArrivalTimeToDate?.toLocaleTimeString(),
              arrivalDate: convertArrivalTimeToDate?.toLocaleDateString(),
              flightCode: flight.flightCode,
              route: {
                id: route?.id,
                departureAirport: route?.departureAirport,
                arrivalAirport: route?.arrivalAirport,
                seatClass: route?.seatClass,
              },
              durationMinutes: flight.durationMinutes,
            }
          : null,
      };
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      page: parsePage,
      limit: parseLimit,
      totalCount,
      totalPages: Math.ceil(totalCount / parseLimit),
      data: formattedResult,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = { getFilteredFlights, getFilteredBaggage, getFilteredCabinBaggage, getFilteredDesc};
