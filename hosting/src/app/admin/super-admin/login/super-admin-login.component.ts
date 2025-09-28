// Arquivo: super-admin-login.component.ts
// Localização: src/app/main/super-admin/login/super-admin-login.component.ts
// Descrição: Componente de login do Super Admin

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SuperAdminAuthService } from '../super-admin-auth.service';

@Component({
    selector: 'app-super-admin-login',
    templateUrl: './super-admin-login.component.html',
    styleUrls: ['./super-admin-login.component.scss']
})
export class SuperAdminLoginComponent implements OnInit {

    loginForm: FormGroup;
    loading = false;
    error = '';
    showPassword = false;

    constructor(
        private formBuilder: FormBuilder,
        private authService: SuperAdminAuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Se já estiver autenticado, redireciona para o painel
        if (this.authService.isAuthenticatedSync()) {
            this.router.navigate(['/super-admin']);
        }

        // Cria o formulário
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    /**
     * Realiza o login
     */
    async onSubmit(): Promise<void> {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.error = '';

        const { username, password } = this.loginForm.value;

        try {
            const result = await this.authService.login(username, password);

            if (result.success) {
                // Login bem-sucedido
                this.router.navigate(['/super-admin']);
            } else {
                // Mostra a mensagem específica do erro
                this.error = result.message || 'Usuário ou senha inválidos';
                this.loginForm.get('password')?.reset();
            }
        } catch (error) {
            this.error = 'Erro ao realizar login. Tente novamente.';
        } finally {
            this.loading = false;
        }
    }

    /**
     * Alterna a visibilidade da senha
     */
    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    /**
     * Testa a conexão com o banco (apenas para debug)
     */
    async testarConexao(): Promise<void> {
        await this.authService.testConnection();
    }
}