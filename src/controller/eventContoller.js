import { ObjectId } from "mongodb";
import { getConnection } from "../config/index.js";
import {
    handleError,
} from "../utils/index.js";

const createEvent = async (req, res) => {
    try {
        const client = getConnection("connectUsingMongodb");
        const db = client.db("customer-crud");

        const caterersCollection = db.collection('caterers');
        const decorationsCollection = db.collection('decorations');
        const lightingsCollection = db.collection('lightings');
        const eventsCollection = db.collection('events');

        const { name, date, caterer, decoration, lighting, catererServices, decorationServices, lightingServices } = req.body;

        if (!name || !date || !caterer || !decoration || !lighting) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!ObjectId.isValid(caterer) || !ObjectId.isValid(decoration) || !ObjectId.isValid(lighting)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const [catererDoc, decorationDoc, lightingDoc] = await Promise.all([
            caterersCollection.findOne({ _id: new ObjectId(caterer) }),
            decorationsCollection.findOne({ _id: new ObjectId(decoration) }),
            lightingsCollection.findOne({ _id: new ObjectId(lighting) })
        ]);

        if (!catererDoc || !decorationDoc || !lightingDoc) {
            return res.status(400).json({ message: 'documents not found' });
        }

        const validateAndCalculateServices = (services, availableServices, category) => {
            if (services && Array.isArray(services)) {
                return services.map(service => {
                    const availableService = availableServices.find(s => s.serviceName === service.serviceName);
                    if (!availableService) {
                        throw new Error(`${category} service ${service.serviceName} not found`);
                    }
                    return {
                        serviceName: service.serviceName,
                        price: availableService.price
                    };
                });
            }
            return [];
        };

        const validatedCatererServices = validateAndCalculateServices(catererServices, catererDoc.services, 'Caterer');
        const validatedDecorationServices = validateAndCalculateServices(decorationServices, decorationDoc.services, 'Decoration');
        const validatedLightingServices = validateAndCalculateServices(lightingServices, lightingDoc.services, 'Lighting');

        const totalPrice = [...validatedCatererServices, ...validatedDecorationServices, ...validatedLightingServices]
            .reduce((sum, service) => sum + service.price, 0);

        const event = {
            name,
            date: new Date(date),
            caterer: new ObjectId(caterer),
            decoration: new ObjectId(decoration),
            lighting: new ObjectId(lighting),
            catererServices: validatedCatererServices,
            decorationServices: validatedDecorationServices,
            lightingServices: validatedLightingServices,
            totalPrice
        };

        const result = await eventsCollection.insertOne(event);
        res.status(200).send({ success: true, data: result });

    } catch (error) {
        handleError(res, error);
    }
}


const getAllEvents = async (req, res) => {
    try {
        const client = getConnection("connectUsingMongodb");
        const db = client.db("customer-crud");
        const eventsCollection = db.collection('events');

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const pipeline = [
            {
                $lookup: {
                    from: 'caterers',
                    localField: 'caterer',
                    foreignField: '_id',
                    as: 'catererDetails'
                }
            },
            {
                $lookup: {
                    from: 'decorations',
                    localField: 'decoration',
                    foreignField: '_id',
                    as: 'decorationDetails'
                }
            },
            {
                $lookup: {
                    from: 'lightings',
                    localField: 'lighting',
                    foreignField: '_id',
                    as: 'lightingDetails'
                }
            },
            { $unwind: '$catererDetails' },
            { $unwind: '$decorationDetails' },
            { $unwind: '$lightingDetails' },
            {
                $addFields: {
                    catererServicesTotal: {
                        $reduce: {
                            input: "$catererServices",
                            initialValue: 0,
                            in: { $add: ["$$value", "$$this.price"] }
                        }
                    },
                    decorationServicesTotal: {
                        $reduce: {
                            input: "$decorationServices",
                            initialValue: 0,
                            in: { $add: ["$$value", "$$this.price"] }
                        }
                    },
                    lightingServicesTotal: {
                        $reduce: {
                            input: "$lightingServices",
                            initialValue: 0,
                            in: { $add: ["$$value", "$$this.price"] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalPrice: {
                        $add: [
                            "$catererServicesTotal",
                            "$decorationServicesTotal",
                            "$lightingServicesTotal"
                        ]
                    }
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    date: 1,
                    catererServices: 1,
                    decorationServices: 1,
                    lightingServices: 1,
                    totalPrice: 1,
                    "catererDetails._id": 1,
                    "catererDetails.name": 1,
                    "decorationDetails._id": 1,
                    "decorationDetails.theme": 1,
                    "lightingDetails._id": 1,
                    "lightingDetails.concept": 1
                }
            }
        ];

        const [events, totalEvents] = await Promise.all([
            eventsCollection.aggregate(pipeline).toArray(),
            eventsCollection.countDocuments()
        ]);

        const totalPages = Math.ceil(totalEvents / limit);

        res.status(200).send({
            success: true,
            data: {
                page,
                totalPages,
                totalEvents,
                events
            }
        });
    } catch (error) {
        handleError(res, error);
    }
}

const updateEvent = async (req, res) => {
    try {
        const client = getConnection("connectUsingMongodb");
        const db = client.db("customer-crud");

        const caterersCollection = db.collection('caterers');
        const decorationsCollection = db.collection('decorations');
        const lightingsCollection = db.collection('lightings');
        const eventsCollection = db.collection('events');

        const { id, name, date, caterer, decoration, lighting, catererServices, decorationServices, lightingServices } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid id' });
        }

        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
        if (!event) {
            throw new Error('Event not found');
        }

        const updates = {};
        if (name) updates.name = name;
        if (date) updates.date = new Date(date);
        if (caterer && ObjectId.isValid(caterer)) updates.caterer = new ObjectId(caterer);
        if (decoration && ObjectId.isValid(decoration)) updates.decoration = new ObjectId(decoration);
        if (lighting && ObjectId.isValid(lighting)) updates.lighting = new ObjectId(lighting);

        const validateAndCalculateServices = async (services, collection, category) => {
            if (!services) return [];

            const document = await collection.findOne({ _id: updates[category] || event[category] });
            if (!document) {
                throw new Error(`${category} not found`);
            }

            const serviceMap = new Map(document.services.map(service => [service.serviceName, service.price]));

            return services.map(service => {
                if (!serviceMap.has(service.serviceName)) {
                    throw new Error(`${category} service ${service.serviceName} not found`);
                }
                return {
                    serviceName: service.serviceName,
                    price: serviceMap.get(service.serviceName)
                };
            });
        };

        let totalPrice = 0;

        updates.catererServices = await validateAndCalculateServices(catererServices, caterersCollection, 'caterer');
        totalPrice += updates.catererServices.reduce((sum, service) => sum + service.price, 0);

        updates.decorationServices = await validateAndCalculateServices(decorationServices, decorationsCollection, 'decoration');
        totalPrice += updates.decorationServices.reduce((sum, service) => sum + service.price, 0);

        updates.lightingServices = await validateAndCalculateServices(lightingServices, lightingsCollection, 'lighting');
        totalPrice += updates.lightingServices.reduce((sum, service) => sum + service.price, 0);

        updates.totalPrice = totalPrice;

        await eventsCollection.updateOne({ _id: id }, { $set: updates });
        res.json({ success: true, message: 'Event updated successfully' });

    } catch (error) {
        handleError(res, error);
    }
}
export default {
    createEvent,
    getAllEvents,
    updateEvent
};