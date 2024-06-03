const decorationSchema = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['theme', 'services'],
        properties: {
            theme: {
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

export default decorationSchema;
