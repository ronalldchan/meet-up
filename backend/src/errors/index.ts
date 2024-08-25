import { dateFormat, timeFormat } from "../utils";

export const ErrorCodes = {
    BAD_REQUEST: "BAD REQUEST",
    INSERT_FAILED: "INSERT_FAILED",
    INSERT_DUPLICATE: "INSERT_DUPLICATE",
    GET_NOT_FOUND: "GET_NOT_FOUND",
    DELETE_NOT_FOUND: "DELETE_NOT_FOUND",
    DELETE_FAILED: "DELETE_FAILED",
    SERVER_ERROR: "SERVER_ERROR",
};

export const InsertErrorMessages = {
    INSERT_FAILED: "Failed to insert the record. Please try again.",
    DUPLICATE_ENTRY: "Duplicate entry detected.",
    MISSING_PARAMETERS: "Required parameters are missing or invalid.",
    INVALID_DATETIME: `Invalid date, time, or timezone. Date should be '${dateFormat}', time should be '${timeFormat}', timezone should be in IANA format`,
};

export const GetErrorMessages = {
    RECORD_NOT_FOUND: "The requested record was not found.",
    GET_FAILED: "Failed to retrieve the record. Please try again.",
};

export const DeleteErrorMessages = {
    RECORD_NOT_FOUND: "The record you are trying to delete does not exist.",
    DELETE_FAILED: "Failed to delete the record. Please try again.",
};
