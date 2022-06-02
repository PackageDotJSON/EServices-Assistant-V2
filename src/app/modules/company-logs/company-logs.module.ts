import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ROUTES } from './routes/routes.constant';

import { ProductsComponent } from 'src/app/modules/company-logs/products/products.component';
import { BankcompanylogComponent } from './bankcompanylog/bankcompanylog.component';
import { ChangecompanyaddressComponent } from './changecompanyaddress/changecompanyaddress.component';
import { ChangecompanynameComponent } from './changecompanyname/changecompanyname.component';
import { ChangecompanyobjectComponent } from './changecompanyobject/changecompanyobject.component';
import { ChangecompanysectorComponent } from './changecompanysector/changecompanysector.component';
import { CompanyServicesComponent } from './companyservices/companyservices.component';
import { DeactivatecompanyComponent } from './deactivatecompany/deactivatecompany.component';
import { DeletecompanyuserComponent } from './deletecompanyuser/deletecompanyuser.component';
import { FeaturesComponent } from './features/features.component';
import { UpdatecompanyofficersComponent } from './updatecompanyofficers/updatecompanyofficers.component';
import { CombinedctcreportComponent } from './combinedctcreport/combinedctcreport.component';
import { CompanyLogsService } from './services/company-logs.service';
import { BankusagereportComponent } from './bankusagereport/bankusagereport.component';

@NgModule({
  declarations: [
    CompanyServicesComponent,
    ProductsComponent,
    FeaturesComponent,
    DeletecompanyuserComponent,
    UpdatecompanyofficersComponent,
    ChangecompanyaddressComponent,
    ChangecompanysectorComponent,
    DeactivatecompanyComponent,
    ChangecompanynameComponent,
    ChangecompanyobjectComponent,
    BankcompanylogComponent,
    CombinedctcreportComponent,
    BankusagereportComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(ROUTES)
  ],
  providers: [CompanyLogsService]
})
export class CompanyLogsModule { }
