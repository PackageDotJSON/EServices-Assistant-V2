// login api url 

export const enum LOGIN_API {
    LOGIN_API = '/api/login',
    FORGOT_PASSWORD_API = '/api/forgotpassword'
}

// admin route api urls

export const enum ADMIN_API {
    TOTAL_DATA = '/api/totalData',
    ADMIN_DATA = '/api/adminData',
    SUB_ADMIN_DATA = '/api/subAdminData',
    MODIFY_RIGHTS = '/api/modifyrights',
    MODIFY_SUB_RIGHTS = '/api/modifysubrights',
    DELETE_SUB_RIGHTS = '/api/deletesubrights',
    SEARCH_DATA = '/api/searchData',
    POST_DATA = '/api/postData'
}

// bank company log api urls

export const enum BANK_COMPANY_LOG_API {
    FETCH_BANK_DATA = '/api/fetchBankData',
    SEARCH_BANK_DATA_ENTITY = '/api/searchBankDataEntity',
    SEARCH_BANK_DATA_DATE = '/api/searchBankDataDate'
}

// change company object api urls 

export const enum CHANGE_COMPANY_OBJECT_API {
    FETCH_ERROR_PROCEED_DATA = '/api/errorproceeds',
    FETCH_ERROR_PROCESS_DATA = '/api/errorprocesses',
    EXPORT_TO_EXCEL = '/api/exporttoExcel',
    DOWNLOAD_EXCEL_FILE = '/api/downloadExcelFile'
}

// change company sector api urls

export const enum CHANGE_COMPANY_SECTOR_API {
    FETCH_CTC_REPORT_SUMMARY = '/api/ctctablesummary',
    FETCH_CTC_TABLES = '/api/fetchctctable',
    SEARCH_CTC_REPORT = '/api/searchctctable',
}

// deactivate company api urls 

export const enum DEACTIVATE_COMPANY_API {
    FETCH_APPLIED_CTC_TABLE = '/api/fetchappliedctctable',
}

// features api urls 

export const enum FEATURE_API {
    FETCH_DATA_BY_NAME_IN_ESERVICES = '/api/fetchDataByNameInEServices',
    FETCH_DATA_BY_NUMBER_IN_ESERVICES = '/api/fetchDataByNumberInEServices',
    FETCH_DATA_BY_NAME_IN_ARCHIVE = '/api/fetchDataByNameInArchive',
    FETCH_DATA_BY_NUMBER_IN_ARCHIVE = '/api/fetchDataByNumberInArchive',
    FETCH_COMPANIES_LIST = '/api/getCompaniesList'
}

// user rights api urls

export const enum USER_RIGHTS_API {
    FETCH_USER_RIGHTS = '/api/allowUserRights'
}

// products api urls

export const enum PRODUCTS_API {
    PROCESS_LIST_BY_COMPANY_NAME = '/api/searchCompanyByName',
    PROCESS_LIST_BY_NUMBER = '/api/searchCompanyByNo',
}

// user profile api urls

export const enum USER_PROFILE_API {
    GET_USER_PROFILE = '/api/getProfile',
    UPDATE_USER_PROFILE = '/api/updateProfile',
    UPDATE_IMAGE = '/api/updateImage',
    GET_PROFILE_PHOTO = '/api/getProfilePhoto',
}

// request logs api

export const enum REQUEST_LOG_API {
    GET_LOG_REQUESTS = '/api/getLogRequests',
    POST_LOG_REQUESTS = '/api/postLogRequests',
    DELETE_LOG_REQUESTS = '/api/deleteLogRequests'
}

//combined ctc report api

export const enum COMBINED_CTC_REPORT_API {
    FETCH_CTC_REPORT = '/api/combinedctcreport'
}

//bank usage report api

export const enum BANK_USAGE_REPORT_API {
    FETCH_BANK_USAGE_REPORT = '/api/getbankusagereport'
}