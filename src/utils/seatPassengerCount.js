const countPassenger = (passengerType, price, totalPassenger) => {
	return {
        id: `${passengerType}-passenger`,
        price: price,
        quantity: totalPassenger,
        name: `${passengerType} Passenger ${totalPassenger} pax`
    }
};

module.exports = countPassenger;