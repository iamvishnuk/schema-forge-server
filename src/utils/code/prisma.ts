import { INode } from '../../definitions/interface';

export const generatePrismaCodeForMongoDB = (node: INode) => {
  let code = `model ${node.data.label} {\n`;

  // Calculate maximum field name length for dynamic padding
  const allFieldNames = [
    'id',
    ...(node.data?.fields.filter((f) => f.name !== '_id').map((f) => f.name) ||
      [])
  ];

  // Add relation field names for padding calculation
  const relationFields =
    node.data?.fields.filter((f) => f.ref && f.name !== '_id') || [];
  relationFields.forEach((field) => {
    // Add relation field name (without 'Id' suffix if present)
    const relationFieldName = field.name.endsWith('Id')
      ? field.name.slice(0, -2)
      : `${field.name}Ref`;
    allFieldNames.push(relationFieldName);
  });

  const maxFieldNameLength = Math.max(
    ...allFieldNames.map((name) => name.length)
  );

  // Calculate maximum type length for dynamic padding
  const allTypes = [
    'String',
    ...(node.data?.fields
      .filter((f) => f.name !== '_id')
      .map((f) => {
        const type = f.type === 'ObjectId' ? 'String' : f.type;
        return f.required ? type : `${type}?`;
      }) || [])
  ];

  // Add relation types for padding calculation
  relationFields.forEach((field) => {
    allTypes.push(field.ref || 'Model');
  });

  const maxTypeLength = Math.max(...allTypes.map((type) => type.length));

  // Add default id field for MongoDB
  const idFieldName = 'id'.padEnd(maxFieldNameLength);
  const idType = 'String'.padEnd(maxTypeLength);
  code += `  ${idFieldName} ${idType} @id @default(auto()) @map("_id") @db.ObjectId\n`;

  // Add other fields
  node.data?.fields.forEach((element) => {
    if (element.name === '_id') return;

    let fieldType = element.type;
    let fieldAttributes = '';

    // Map types
    if (element.type === 'ObjectId') {
      fieldType = 'String';
      fieldAttributes += ' @db.ObjectId';
    }

    // Add required/optional marker
    const isRequired = element.required ? '' : '?';
    const typeWithOptional = `${fieldType}${isRequired}`;

    // Format field name and type with proper spacing
    const fieldName = element.name.padEnd(maxFieldNameLength);
    const paddedType = typeWithOptional.padEnd(maxTypeLength);

    code += `  ${fieldName} ${paddedType}`;

    // Add unique constraint
    if (element.isUnique) {
      fieldAttributes += ' @unique';
    }

    code += fieldAttributes + '\n';
  });

  // Add relation fields
  relationFields.forEach((field) => {
    const relationFieldName = field.name.endsWith('Id')
      ? field.name.slice(0, -2)
      : `${field.name}Ref`;

    const paddedRelationName = relationFieldName.padEnd(maxFieldNameLength);
    const paddedRelationType = (field.ref || 'Model').padEnd(maxTypeLength);

    code += `  ${paddedRelationName} ${paddedRelationType} @relation(fields: [${field.name}], references: [id])\n`;
  });

  // Add spacing before indexes
  const indexedFields = node.data?.fields.filter(
    (field) => field.index && field.name !== '_id'
  );
  if (indexedFields && indexedFields.length > 0) {
    code += '\n';
    indexedFields.forEach((field) => {
      code += `  @@index([${field.name}])\n`;
    });
  }

  code += '}';
  return code;
};
export const generatePrismaCodeForRelational = (node: INode) => {
  let code = `model ${node.data.label} {\n`;

  // Add default id field for relational databases
  code += `  id Int @id @default(autoincrement())\n`;

  // Add other fields
  node.data?.fields.forEach((element) => {
    if (element.name === '_id') return;

    let fieldType = element.type;

    // Map types for relational databases
    if (element.type === 'ObjectId') {
      fieldType = 'Int'; // Assuming foreign key as Int
    }

    // Add required/optional marker
    const isRequired = element.required ? '' : '?';

    code += `  ${element.name} ${fieldType}${isRequired}`;

    // Add unique constraint
    if (element.isUnique) {
      code += ' @unique';
    }

    code += '\n';
  });

  // Add indexes at the end
  const indexedFields = node.data?.fields.filter(
    (field) => field.index && field.name !== '_id'
  );
  indexedFields?.forEach((field) => {
    code += `\n  @@index([${field.name}])`;
  });

  code += '\n}';
  return code;
};
