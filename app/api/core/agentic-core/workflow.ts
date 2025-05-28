import { RunnablePassthrough } from "@langchain/core/runnables";
import { AgentState } from "../../../../lib/types";
import { generateUISchema } from "./agents/generator";
import { validateSchema } from "./agents/validator";
import { generateCode } from "./agents/codegen";

export async function createWorkflow() {
  // Create the workflow steps
  const generateSchemaStep = new RunnablePassthrough<AgentState>().pipe(generateUISchema);
  const validateSchemaStep = new RunnablePassthrough<AgentState>().pipe(validateSchema);
  const generateCodeStep = new RunnablePassthrough<AgentState>().pipe(generateCode);

  // Chain the steps together
  const workflow = generateSchemaStep
    .pipe(validateSchemaStep)
    .pipe((state: AgentState) => state.validationPassed ? generateCodeStep.invoke(state) : state);

  return workflow;
}
