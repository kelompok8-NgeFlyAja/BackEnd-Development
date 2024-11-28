if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { createClient } = require('@supabase/supabase-js');
// const supabaseUrl = 'https://wpwudzwmrfrjhnmgqryr.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY
// const supabase = createClient(supabaseUrl, supabaseKey)

// const addNewAirport = async (req, res, next) => {
//     try {
//         let { name, city, country, continent, airportCode} = req.body;
//         if(typeof(name)!== 'string' || typeof(city)!== 'string' || typeof(country)!== 'string' || typeof(airportCode)!== 'string' || typeof(continent)!== 'string') {
//             return res.status(400).json({message: "Invalid input data"});
//         }
//         name = name.trim();
//         city = city.trim();
//         country = country.trim();
//         airportCode = airportCode.trim();
//         continent = continent.trim();
//         if (!name || !city || !country || !airportCode ||!continent) {
//             return res.status(400).send('Please provide all required fields');
//         }
//         const {data, error} = await supabase
//             .from('Airports')
//             .insert([{ name, city, country, continent, airportCode}])
//             .single();
//         if (error) {
//             console.error('Supabase Insert Error:', error.message);
//             return res.status(500).json({ message: 'Failed to add airport.', error: error.message });
//         }
//         return res.status(201).json({
//             message: 'Airport added successfully.',
//         });
//     } catch (error) {
//         return res.status(500).json({message: "Error adding new airport"});
//     }
// }

// const getAllAirports = async (req, res, next) => {
//     try {
//         const {data, error} = await supabase
//             .from('Airports')
//             .select('*');
//         if (error) {
//             console.error('Supabase Select Error:', error.message);
//             return res.status(500).json({ message: 'Failed to fetch airports.', error: error.message });
//         }
//         return res.status(200).json({ data });
//     } catch (error) {
//         return res.status(500).json({message: "Error fetching airports"});
//     }
// }

// const deleteAirport = async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         if (!id) {
//             return res.status(400).json({ message: 'Please provide an ID.' });
//         }
//         const { data: airport, error: fetchError } = await supabase
//             .from('Airports')
//             .select('id')
//             .eq('id', id)
//             .single();

//         if (fetchError || !airport) {
//             console.error('Supabase Fetch Error:', fetchError?.message || 'ID not found.');
//             return res.status(404).json({ message: 'Airport not found.' });
//         }

//         const { data, error: deleteError } = await supabase
//             .from('Airports')
//             .delete()
//             .eq('id', id);

//         if (deleteError) {
//             return res.status(500).json({ message: 'Failed to delete airport.', error: deleteError.message });
//         }
//         return res.status(200).json({ message: 'Airport deleted successfully.'});
//     } catch (err) {
//         console.error('Unhandled Error:', err);
//         return res.status(500).json({ message: 'Error deleting airport.' });
//     }
// };

// const addMultipleAirports = async (req, res, next) => {
//     try {
//         const airports = req.body;
//         for (const [index, airport] of airports.entries()) {
//             const { name, city, country, continent, airportCode } = airport;
        
//             if (![name, city, country, continent, airportCode].every(field => typeof field === 'string' && field.trim() !== '')) {
//                 return res.status(400).json({
//                     message: `Invalid input data at index ${index}. Each airport must have non-empty string fields.`,
//                     invalidData: airport,
//                 });
//             }
//         }        

//         const { data, error } = await supabase
//             .from('Airports')
//             .insert(airports) 
//             .select('*'); 

//         if (error) {
//             console.error('Supabase Insert Error:', error.message);
//             return res.status(500).json({
//                 message: 'Failed to add airports.',
//                 error: error.message,
//             });
//         }

//         if (!data) {
//             return res.status(500).json({ message: 'Unexpected error: no data returned after insertion.' });
//         }

//         return res.status(201).json({
//             message: 'Airports added successfully.'
//         });
//     } catch (err) {
//         console.error('Unhandled Error:', err);
//         return res.status(500).json({ message: "Error adding airports." });
//     }
// };

const addNewAirport = async (req, res, next) => {
    try {
        const { name, city, country, continent, airportCode } = req.body;
        if (!name || !city || !country || !continent || !airportCode) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const airport = await prisma.airports.create({
            data: {
                name,
                city,
                country,
                continent,
                airportCode,
            },
        });

        return res.status(201).json({
            message: 'Airport added successfully.',
            airport,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding airport.', error: error.message });
    }
};

const getAllAirports = async (req, res, next) => {
    try {
        const airports = await prisma.airports.findMany();
        return res.status(200).json({ airports });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching airports.', error: error.message });
    }
}

const deleteAirport = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Please provide an ID.' });
        }

        const airport = await prisma.airports.findUnique({
            where: { id },
        });

        if (!airport) {
            return res.status(404).json({ message: 'Airport not found.' });
        }

        await prisma.airports.delete({
            where: { id },
        });

        return res.status(200).json({ message: 'Airport deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting airport.', error: error.message });
    }
}

const addMultipleAirports = async (req, res, next) => {
    try {
        const airports = req.body;
        if (!Array.isArray(airports) || airports.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of airports.' });
        }

        const airportData = airports.map(airport => {
            const { name, city, country, continent, airportCode } = airport;
            if (!name || !city || !country || !continent || !airportCode) {
                return null;
            }

            return {
                name,
                city,
                country,
                continent,
                airportCode,
            };
        }).filter(Boolean);

        if (airportData.length === 0) {
            return res.status(400).json({ message: 'Invalid airport data provided.' });
        }

        const newAirports = await prisma.airports.createMany({
            data: airportData,
        });

        return res.status(201).json({
            message: 'Airports added successfully.',
            airports: newAirports,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding airports.', error: error.message });
    }
}


module.exports = {addNewAirport, deleteAirport, getAllAirports, addMultipleAirports};