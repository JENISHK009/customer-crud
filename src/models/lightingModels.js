const lightingSchema = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['concept', 'services'],
        properties: {
            concept: {
                bsonType: 'string',
            },
            services: {
                bsonType: 'array',
                items: {
                    bsonType: 'object',
                    required: ['serviceName', 'price'],
                    properties: {
                        serviceName: {
                            bsonType: 'string',
                        },
                        price: {
                            bsonType: 'number',
                        }
                    }
                }
            }
        }
    }
};

export default lightingSchema;
