/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
import { emptySplitApi as api } from "../empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getParsedData: build.query<GetParsedDataApiResponse, GetParsedDataApiArg>({
      query: () => ({ url: `/api/DataParser` }),
    }),
    parseData: build.mutation<ParseDataApiResponse, ParseDataApiArg>({
      query: (queryArg) => ({
        url: `/api/DataParser`,
        method: "POST",
        body: queryArg.parseDataRequest,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as dataParserApi };
export type GetParsedDataApiResponse = /** status 200  */ ParsedDataItem[];
export type GetParsedDataApiArg = void;
export type ParseDataApiResponse = /** status 200  */ number;
export type ParseDataApiArg = {
  parseDataRequest: ParseDataRequest;
};
export type ParsedDataItem = {
  id?: number;
  originalInput?: string | null;
  parsedJson?: string | null;
  confidence?: number;
  createdAt?: string;
};
export type ParseDataRequest = {
  inputText: string;
};
export const {
  useGetParsedDataQuery,
  useParseDataMutation,
} = injectedRtkApi;