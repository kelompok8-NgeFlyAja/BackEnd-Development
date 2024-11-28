function generateDuration(departureTime, arrivalTime) {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    if (departure > arrival) {
        throw new Error('Departure time cannot be greater than arrival time ');
    }

    const durationInMinutes = Math.floor((arrival - departure) / 60000);

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;

};

module.exports = generateDuration 