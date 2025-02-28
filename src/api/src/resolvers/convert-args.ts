import { ArgParamMetadata, ClassMetadata, ArgsParamMetadata } from "../metadata/definitions";
import { convertToType } from "../helpers/types";
import { ArgsDictionary, ClassType } from "../interfaces";
import { getMetadataStorage } from "../metadata/getMetadataStorage";
import { TypeValue } from "../decorators/types";

interface TransformationTreeField {
  name: string;
  target: TypeValue;
  fields?: TransformationTree;
}

interface TransformationTree {
  target: TypeValue;
  getFields: () => TransformationTreeField[];
}

const generatedTrees = new Map<TypeValue, TransformationTree | null>();

function getInputType(target: TypeValue): ClassMetadata | undefined {
  return getMetadataStorage().inputTypes.find(t => t.target === target);
}

function getArgsType(target: TypeValue): ClassMetadata | undefined {
  return getMetadataStorage().argumentTypes.find(t => t.target === target);
}

function generateInstanceTransformationTree(target: TypeValue): TransformationTree | null {
  if (generatedTrees.has(target)) {
    return generatedTrees.get(target)!;
  }

  const inputType = getInputType(target);
  if (!inputType) {
    generatedTrees.set(target, null);
    return null;
  }

  function generateTransformationTree(metadata: ClassMetadata): TransformationTree {
    let inputFields = metadata.fields!;
    let superClass = Object.getPrototypeOf(metadata.target);
    while (superClass.prototype !== undefined) {
      const superInputType = getInputType(superClass);
      if (superInputType) {
        inputFields = [...inputFields, ...superInputType.fields!];
      }
      superClass = Object.getPrototypeOf(superClass);
    }

    const transformationTree: TransformationTree = {
      target: metadata.target,
      getFields: () =>
        inputFields.map<TransformationTreeField>(field => {
          const fieldTarget = field.getType();
          const fieldInputType = getInputType(fieldTarget);
          return {
            name: field.name,
            target: fieldTarget,
            fields:
              fieldTarget === metadata.target
                ? transformationTree
                : fieldInputType && generateTransformationTree(fieldInputType),
          };
        }),
    };

    return transformationTree;
  }

  const generatedTransformationTree = generateTransformationTree(inputType);
  generatedTrees.set(target, generatedTransformationTree);
  return generatedTransformationTree;
}

function convertToInput(tree: TransformationTree, data: any) {
  if (data == null) {
    // skip converting undefined and null
    return data;
  }
  //vidalii-change
  //the next code initialized to the input class, removing the files not defined in the input
  // return data
  //vidalii-originial
  const inputFields = tree.getFields().reduce<Record<string, any>>((fields, field) => {
    const siblings = field.fields;
    const value = data[field.name];
    // don't create property for nullable field
    if (value !== undefined) {
      if (value === null || !siblings) {
        fields[field.name] = convertToType(field.target, value);
      } else if (Array.isArray(value)) {
        fields[field.name] = value.map(itemValue => convertToInput(siblings, itemValue));
      } else {
        fields[field.name] = convertToInput(siblings, value);
      }
    }
    return fields;
  }, {});

  return convertToType(tree.target, inputFields);
}

function convertValueToInstance(target: TypeValue, value: any) {
  const transformationTree = generateInstanceTransformationTree(target);
  return transformationTree
    ? convertToInput(transformationTree, value)
    : convertToType(target, value);
}

function convertValuesToInstances(target: TypeValue, value: any) {
  // skip converting undefined and null
  if (value == null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(itemValue => convertValueToInstance(target, itemValue));
  }
  return convertValueToInstance(target, value);
}

export function convertArgsToInstance(argsMetadata: ArgsParamMetadata, args: ArgsDictionary) {
  const ArgsClass = argsMetadata.getType() as ClassType;
  const argsType = getArgsType(ArgsClass)!;

  let argsFields = argsType.fields!;
  let superClass = Object.getPrototypeOf(argsType.target);
  while (superClass.prototype !== undefined) {
    const superArgumentType = getArgsType(superClass);
    if (superArgumentType) {
      argsFields = [...argsFields, ...superArgumentType.fields!];
    }
    superClass = Object.getPrototypeOf(superClass);
  }

  const transformedFields = argsFields.reduce<Record<string, any>>((fields, field) => {
    const fieldValue = args[field.name];
    // don't create property for nullable field
    if (fieldValue !== undefined) {
      const fieldTarget = field.getType();
      fields[field.name] = convertValuesToInstances(fieldTarget, fieldValue);
    }
    return fields;
  }, {});
  return convertToType(ArgsClass, transformedFields);
}

export function convertArgToInstance(argMetadata: ArgParamMetadata, args: ArgsDictionary) {
  const argValue = args[argMetadata.name];
  const argTarget = argMetadata.getType();
  return convertValuesToInstances(argTarget, argValue);
}
