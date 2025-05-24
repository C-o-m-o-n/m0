import { UISchema } from "../../../lib/types";

// Define ComponentSchema type (adjust as needed)
// type ComponentSchema = {
//   type: string;
//   props: Record<string, unknown>;
//   children?: ComponentSchema[];
// };

export const generateCode = (schema: UISchema): string => {
  const components = schema.components.map((component) => {
    return `<${component.type} ${propsToString(component.props)} />`;
  });

  const getUniqueComponents = (schema: UISchema): string => {
  const types = new Set(schema.components.map(c => c.type));
  return Array.from(types).join(", ");
};

//   const componentToJSX = (component: ComponentSchema): string => {
//     const children = component.children
//       ? component.children.map(componentToJSX).join("\n")
//       : "";
//     return `<${component.type} ${propsToString(component.props)}>${children}</${component.type}>`;
//   };


  return `
    import React from 'react';
    import { ${getUniqueComponents(schema)} } from 'react-native';

    export default function GeneratedScreen() {
      return (
        ${components.join("\n")}
      );
    }

    // Add this to the generated code
    const styles = StyleSheet.create({ ... });
    // Then map props like: style={styles.container}
  `;
};

// Helper: Convert props object to string
const propsToString = (props: Record<string, unknown>) => {
  return Object.entries(props)
    .map(([key, val]) => `${key}={${JSON.stringify(val)}}`)
    .join(" ");
};

