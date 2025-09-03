import { todosApi } from "../generated/todos";

export const enhancedTodosApi = todosApi.enhanceEndpoints({
    addTagTypes: [],
    endpoints: {}
});

// No hooks exported since todos API is deprecated