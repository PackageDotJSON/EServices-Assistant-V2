import { Routes } from '@angular/router';
import { ProductsComponent } from 'src/app/modules/company-logs/products/products.component';
import { BankcompanylogComponent } from '../bankcompanylog/bankcompanylog.component';
import { BankusagereportComponent } from '../bankusagereport/bankusagereport.component';
import { ChangecompanyaddressComponent } from '../changecompanyaddress/changecompanyaddress.component';
import { ChangecompanynameComponent } from '../changecompanyname/changecompanyname.component';
import { ChangecompanyobjectComponent } from '../changecompanyobject/changecompanyobject.component';
import { ChangecompanysectorComponent } from '../changecompanysector/changecompanysector.component';
import { CombinedctcreportComponent } from '../combinedctcreport/combinedctcreport.component';
import { CompanyServicesComponent } from '../companyservices/companyservices.component';
import { DeactivatecompanyComponent } from '../deactivatecompany/deactivatecompany.component';
import { DeletecompanyuserComponent } from '../deletecompanyuser/deletecompanyuser.component';
import { FeaturesComponent } from '../features/features.component';
import { UpdatecompanyofficersComponent } from '../updatecompanyofficers/updatecompanyofficers.component';

export const ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'viewcompanyrecords',
        component: FeaturesComponent,
      },
      {
        path: 'combinedctcreport',
        component: CombinedctcreportComponent
      },
      {
        path: 'bankusagereport',
        component: BankusagereportComponent
      },
      {
        path: 'checkcompanyuser',
        component: CompanyServicesComponent,
      },
      {
        path: 'viewcompanysubmissionmode',
        component: ProductsComponent,
      },
      { path: 'deletecompanyuser', component: DeletecompanyuserComponent },
      {
        path: 'updatecompanyofficers',
        component: UpdatecompanyofficersComponent,
      },
      {
        path: 'changecompanyaddress',
        component: ChangecompanyaddressComponent,
      },
      {
        path: 'ctcfilingstatusreport',
        component: ChangecompanysectorComponent,
      },
      { path: 'appliedctcreport', component: DeactivatecompanyComponent },
      { path: 'searchbanktransactionlog', component: BankcompanylogComponent },
      { path: 'changecompanyname', component: ChangecompanynameComponent },
      {
        path: 'processreport-statuswise',
        component: ChangecompanyobjectComponent,
      },
      {
        path: 'processreportbystatus',
        component: ChangecompanyobjectComponent
      }
    ],
  },
];
