const categorySchema = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name'],
        properties: {
            name: {
                bsonType: 'string',
                uniqueItems: true
            }
        }
    }
};

export default categorySchema;
