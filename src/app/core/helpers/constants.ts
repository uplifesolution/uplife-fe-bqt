export class Constants {
  public static readonly PageSize = 20;
  public static readonly BusinessType = {
    DNTN: 'Doanh nghiệp tư nhân',
    TNHH1TV: 'Công ty TNHH một thành viên',
    TNHH2TV: 'Công ty TNHH hai thành viên',
    JSC: 'Công ty cổ phần',
    STATE: 'Doanh nghiệp nhà nước',
    COOP: 'Hợp tác xã',
    BRANCH: 'Chi nhánh / VPĐD'
  };
  // chức năng hệ thống
  public static readonly Function = {
    Dashboard: 'DASHBOARD',
    InvestorManagement: 'INVESTOR_MANAGEMENT',
    InvestorInformation: 'INVESTOR_INFORMATION',
    ActionManagement: 'ACTION_MANAGEMENT',
    FunctionManagement: 'FUNCTION_MANAGEMENT',
    RoleManagement: 'ROLE_MANAGEMENT',
    ComplaintManagement: 'COMPLAINT_MANAGEMENT',
    ComplaintCategoryManagement: 'COMPLAINT_CATEGORIES_MANAGEMENT',
    CommonCategoryManagement: 'COMMON_CATEGORY_MANAGEMENT',
    BuildingManagement: 'BUILDING_MANAGEMENT',
    ManagementBoard: 'MANAGEMENT_BOARD',
    ManagementInformation: 'MANAGEMENT_BOARD_INFORMATION',
    EmployeeManagement: 'EMPLOYEE_MANAGEMENT',
    ApartmentManagement: 'APARTMENT_MANAGEMENT',
    VehicleManagement: 'VEHICLE_REQUEST_MANAGEMENT',
    InvoiceManagement: 'INVOICE_MANAGEMENT',
    InvoiceAdditionalManagement: 'INVOICE_ADDITIONAL_MANAGEMENT',
    ParkingLogManagement: 'PARKING_LOG_MANAGEMENT',
    ParkingSlotManagement: 'PARKING_SLOT_MANAGEMENT',
    ParkingRuleManagement: 'PARKING_RULE_CONFIG',
    QuotaManagement: 'QUOTA_MANAGEMENT',
    ServiceManagement: 'SERVICE_MANAGEMENT',
    ServiceCostPaymentManagement: 'SERVICE_COST_PAYMENT_MANAGEMENT',
    InvoicePeriodManagement: 'INVOICE_PERIOD_MANAGEMENT',
    ResidentManagement: 'RESIDENT_MANAGEMENT',
    PolicyRuleManagement: 'POLICY_RULE_MANAGEMENT',
    WorkShiftManagement: 'SHIFT_MANAGEMENT',
    CaseLogManagement: 'CASE_LOG_MANAGEMENT',
    CommitteeManagement: 'COMMITTEE_MANAGEMENT',
    VotingEventManagement: 'VOTING_EVENT_MANAGEMENT',
    ConstructionManagement: 'CONSTRUCTION_MANAGEMENT'
  };

  // thao tac trong he thong
  public static readonly Action_Create = 'CREATE';
  public static readonly Action_Update = 'UPDATE';
  public static readonly Action_UpdateLogo = 'UPLOAD_LOGO';
  public static readonly Action_Delete = 'DELETE';
  public static readonly Action_Detail = 'VIEW_DETAIL';
  public static readonly Action_View = 'VIEW';
  public static readonly Action_Approve = 'APPROVE';
  public static readonly Action_Reject = 'REJECT';
  public static readonly Action_GenerateInvoice = 'GENERATE_INVOICE';
  public static readonly Action_GenerateQR = 'GENERATE_QR';
  public static readonly Action_UpdateStatus = 'UPDATE_STATUS';
  public static readonly Action_SendInfo = 'SEND_INFO';
  public static readonly Action_InvoiceSummary = 'INVOICE_SUMMARY';

  // regex
  public static Regex_Email = /[^.][a-zA-Z0-9.-_][^<>/:;,+=@]{1,}@[a-zA-Z]{2,}[.][a-zA-Z]{2,}/;
  public static Regex_Phone = /^[0-9]{10}$/;
  public static Regex_TimeFormat = /^([0-1]?d|2[0-3]):[0-5]d$/;
  public static Regex_OnlyNumber = /^\d*$/;
  public static Regex_AlphabetAndNumeric = /^[a-zA-Z0-9]*$/;
  public static Regex_AlphabetNumericSpace = /^[a-zA-Z0-9 ]*$/;
  public static Regex_BlockSpecialCharacter = /^[^~`!@#$%^&()_={}[\]:;,.<>+\/?-]*$/;

  // Mã danh mục
  public static DropList_Complaint_Type = 'COMPLAINT_CATEGORY';
  public static DropList_Complaint_Priority = 'COMPLAINT_PRIORITY';
  public static DropList_Complaint_Status = 'COMPLAINT_STATUS';
  public static DropList_Investor_Business_Type = 'INVESTOR_BUSINESS_TYPE';
  public static DropList_Investor_Business_Status = 'INVESTOR_BUSINESS_STATUS';
  public static DropList_Investor_Usage_Status = 'INVESTOR_USAGE_STATUS';
  public static DropList_Building_Status = 'BUILDING_STATUS';
  public static DropList_Apartment_Status = 'APARTMENT_STATUS';
  public static DropList_VehicleRequest_Status = 'VEHICLE_REQUEST_STATUS';
  public static DropList_VehicleRequestType = 'VEHICLE_REQUEST_TYPE';
  public static DropList_VehicleType = 'VEHICLE_TYPE';
  public static DropList_VehicleColor = 'VEHICLE_COLOR';
  public static DropList_IdentifyType = 'DOCUMENT_TYPE';
  public static DropList_Employee_TechnicalType = 'TECHNICAL_TYPE';
  public static DropList_EmploymentType = 'EMPLOYEE_EMPLOYMENT_TYPE';
  public static DropList_ManagementBoardStaffType = 'MANAGEMENT_BOARD_STAFF_TYPE';
  public static DropList_Gender = 'COMMON_GENDER';
  public static DropList_ServiceType = 'SERVICE_TYPE';
  public static DropList_TicketType = 'TICKET_TYPE';
  public static DropList_VotingEventType = 'VOTING_EVENT_TYPE';
  public static DropList_VotingEventStatus = 'VOTING_EVENT_STATUS';
  public static DropList_VotingStatus = 'VOTE_STATUS';
  public static DropList_PaymentStatus = 'PAYMENT_STATUS';
  public static DropList_InvoiceStatus = 'INVOICE_STATUS';
  public static DropList_CommonStatus = 'COMMON_STATUS';
  public static DropList_PriorityLevel = 'COMMON_PRIORITY_LEVEL';
  public static DropList_PolicyRuleType = 'POLICY_RULE_TYPE';
  public static DropList_PaymentMethod = 'PAYMENT_METHOD';

  //key field
  public static FieldId = 'id';

  // vai trò
  public static RoleSuperAdmin = 'SUPER_ADMIN';
  public static RoleInvestor = 'INVESTOR';
  public static RoleManager = 'MANAGER';

  //ECM
  public static Ecm = {
    Folder: 'Folder',
    File: 'File'
  };

  public static StatusComplaint = {
    New: 'NEW',
    Note: 'NOTE',
    Pending: 'PENDING',
    Processing: 'IN_PROGRESS',
    Pause: 'PAUSED',
    Reject: 'REJECTED',
    Cancel: 'CANCELLED',
    Complete: 'COMPLETED'
  };
}
