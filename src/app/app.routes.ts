import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { CreateAccountComponent } from './features/auth/create-account/create-account.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainDashboardLayoutComponent } from './features/dashboard/main-dashboard-layout/main-dashboard-layout.component';
import { CompanySearchComponent } from './features/dashboard/pages/company-search/company-search.component';
import { MarketCalculatorComponent } from './features/dashboard/pages/market-calculator/market-calculator.component';
import { HomeComponent } from './features/pages/Home/Home.component';
import { AuthGuard } from './shared/gards/auth.guard';
import { PlansComponent } from './features/pages/plans/plans.component';
import { PaymentComponent } from './features/pages/plans/payment/payment.component';
import { SolutionsComponent } from './features/pages/solutions/solutions.component';
import { PaymentFeedbackComponent } from './features/pages/plans/payment-feedback/payment-feedback.component';

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'dashboard', redirectTo: 'dashboard/home' },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'login', component: LoginComponent, title: 'Login', data: ['Login'] },
            { path: 'create-account', component: CreateAccountComponent, title: 'Criar Conta', data: ['Criar Conta'] },
            { path: 'pricing', component: PlansComponent, title: 'Planos', data: ['Planos']},
            { path: 'solutions', component: SolutionsComponent, title: 'Soluções', data: ['Soluções']},
            {
                path: 'dashboard',
                pathMatch: 'prefix',
                component: MainDashboardLayoutComponent,
                canActivate: [AuthGuard],
                children: [
                    { path: 'home', component: DashboardComponent, title: 'Dashboard', data: ['Dashboard'] },
                    { path: 'company-search', component: CompanySearchComponent, title: 'Empresas', data: ['Empresas'] },
                    { path: 'calculator', component: MarketCalculatorComponent, title: 'Calculadora', data: ['Calculadora'] },
                    { path: 'upgrade', component: PlansComponent, title: 'Planos', data: ['Planos']},
                    {path: 'feedback-transaction', component: PaymentFeedbackComponent, title: 'Feedback de pagamento'}
                ]
            }
        ],
    }
];
