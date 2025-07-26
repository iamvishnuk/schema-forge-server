import { INode } from '../../definitions/interface';

export const generateMongooseCode = (node: INode) => {
  let code =
    "const mongoose = required('mongoose');\nconst { Schema } = mongoose;\n\n";
  code += `const ${node.data.label.toLowerCase()}Schema = new Schema({\n`;

  node.data?.fields.forEach((element) => {
    if (element.name === '_id') return;

    code += `   ${element.name}: {\n`;

    code += `       type: ${element.type === 'ObjectId' ? 'Schema.Types.ObjectId' : element?.type},\n`;
    if (element.required) code += `       required: true, \n`;
    if (element.isUnique) code += `       unique: true, \n`;
    if (element.index) code += `       index: true, \n`;

    code += '   },\n';
  });

  code += '})\n\n';

  code += `module.export = mongoose.model('${node.data.label}', ${node.data.label.toLowerCase()}Schema)`;

  return code;
};
