const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

module.exports = { getFilteredFlights };
