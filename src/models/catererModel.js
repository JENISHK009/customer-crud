const catererSchema = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'services'],
        properties: {
            name: {
                bsonType: 'string',
                uniqueItems: true
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

export default catererSchema;
