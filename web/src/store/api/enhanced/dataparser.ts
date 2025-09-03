import { dataParserApi } from "../generated/dataparser";

export const enhancedDataParserApi = dataParserApi.enhanceEndpoints({
    addTagTypes: [
        'PARSED_DATA', 
    ],
    endpoints: {
        getParsedData: {
            providesTags: ['PARSED_DATA'],
        },
        parseData: {
            invalidatesTags: ['PARSED_DATA'],
        },
    }
});

export const {
  useGetParsedDataQuery,
  useParseDataMutation,
} = enhancedDataParserApi;