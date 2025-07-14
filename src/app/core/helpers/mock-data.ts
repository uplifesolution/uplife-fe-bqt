import { MenuItem } from 'primeng/api';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@/core/guards/auth.service';
import { Constants } from '@/helpers/constants';

@Injectable()
export class MockData {
  auth = inject(AuthService);
  menuSupperAdmin: MenuItem[] = [
    {
      label: 'Dashboard'
    },
    {
      label: `breadcrumb.management`,
      items: [
        {
          label: `breadcrumb.investor`,
          id: Constants.Function.InvestorManagement,
          routerLink: '/investor'
        },
        {
          label: `breadcrumb.function`,
          id: Constants.Function.FunctionManagement,
          routerLink: '/function'
        },
        {
          label: `breadcrumb.action`,
          id: Constants.Function.ActionManagement,
          routerLink: '/action'
        },
        {
          label: `breadcrumb.role`,
          id: Constants.Function.RoleManagement,
          routerLink: '/role'
        },
        {
          label: `breadcrumb.commonCategory`,
          id: Constants.Function.CommonCategoryManagement,
          routerLink: '/common-category'
        }
      ]
    }
  ];

  menuInvestor: MenuItem[] = [
    {
      label: 'Dashboard'
    },
    {
      label: `breadcrumb.management`,
      items: [
        {
          icon: 'icon-menu-investor',
          label: `breadcrumb.investorInformation`,
          id: Constants.Function.InvestorInformation,
          routerLink: '/investor-information'
        },
        {
          icon: 'icon-menu-management-board',
          label: `breadcrumb.managementBoard`,
          id: Constants.Function.ManagementBoard,
          routerLink: '/management-board'
        },
        {
          icon: 'icon-menu-building',
          label: `breadcrumb.building`,
          id: Constants.Function.BuildingManagement,
          routerLink: '/building'
        }
      ]
    }
  ];

  menuManager: MenuItem[] = [
    {
      label: 'breadcrumb.report',
      items: [
        {
          label: `breadcrumb.dashboard`,
          id: Constants.Function.Dashboard,
          routerLink: '/dashboard'
        }
      ]
    },
    {
      label: 'breadcrumb.apartment',
      items: [
        {
          icon: 'icon-menu-apartment',
          label: `breadcrumb.apartmentManagement`,
          expanded: false,
          items: [
            {
              label: `breadcrumb.apartmentList`,
              id: Constants.Function.ApartmentManagement,
              routerLink: '/apartment'
            },
            {
              label: `breadcrumb.constructionManagement`,
              id: Constants.Function.ConstructionManagement,
              routerLink: '/construction-management'
            }
          ]
        },
        {
          icon: 'icon-menu-resident',
          label: `breadcrumb.resident`,
          id: Constants.Function.ResidentManagement,
          routerLink: '/resident'
        },
        {
          icon: 'icon-menu-building',
          label: `breadcrumb.buildingManagement`,
          id: Constants.Function.BuildingManagement,
          routerLink: '/building'
        },
        {
          icon: 'icon-menu-policyRule',
          label: `breadcrumb.policyRuleManagement`,
          id: Constants.Function.PolicyRuleManagement,
          routerLink: '/policy-rule'
        },
        {
          icon: 'icon-menu-management-board',
          label: `breadcrumb.committeeManagement`,
          id: Constants.Function.CommitteeManagement,
          routerLink: '/committees-management'
        },
        {
          id: 'breadcrumb.notifyManagement',
          icon: 'icon-menu-notifications',
          label: `breadcrumb.notifyManagement`,
          expanded: false,
          items: [
            {
              label: `breadcrumb.votingEvent`,
              id: Constants.Function.VotingEventManagement,
              routerLink: '/notify/vote'
            }
          ]
        }
      ]
    }
  ];

  getMenu(): MenuItem[] {
    const role = this.auth.getRoleSelect();
    if (role === Constants.RoleSuperAdmin) {
      return this.menuSupperAdmin;
    } else if (role === Constants.RoleInvestor) {
      return this.menuInvestor;
    } else if (role === Constants.RoleManager) {
      return this.menuManager;
    }
    return [];
  }
}
