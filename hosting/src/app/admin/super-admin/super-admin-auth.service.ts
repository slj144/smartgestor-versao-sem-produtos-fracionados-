/**
 * Arquivo: super-admin-auth.service.ts
 * Localização: src/app/main/super-admin/super-admin-auth.service.ts
 * 
 * Descrição: Serviço de autenticação para Super Administradores
 * - Gerencia login/logout de super admins
 * - Valida credenciais no banco de dados
 * - Controla sessões e tokens de acesso
 * - Implementa sistema de proteção contra ataques de força bruta
 * - Registra logs de acesso e atividades
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
// Importa o iTools do local correto do seu projeto
const iTools = require('../../../assets/tools/iTools').iTools;

@Injectable({
    providedIn: 'root'
})
export class SuperAdminAuthService {

    private readonly SESSION_KEY = 'superAdminSession';
    private readonly SUPER_ADMIN_COLLECTION = 'SuperAdmins';
    private loginAttempts = 0;
    private readonly MAX_ATTEMPTS = 5;
    private attemptResetTime: number = 0;

    constructor(private router: Router) { }

    /**
     * Realiza o login do Super Admin consultando credenciais no banco
     */
    async login(username: string, password: string): Promise<{ success: boolean, message?: string }> {
        console.log('🔐 Iniciando processo de login...');
        console.log('📧 Email tentando logar:', username);

        try {
            // Verifica se ainda está em período de bloqueio
            if (this.attemptResetTime > Date.now()) {
                const minutosRestantes = Math.ceil((this.attemptResetTime - Date.now()) / 60000);
                return {
                    success: false,
                    message: `Muitas tentativas. Aguarde ${minutosRestantes} minutos.`
                };
            }

            // Verifica tentativas
            if (this.loginAttempts >= this.MAX_ATTEMPTS) {
                this.attemptResetTime = Date.now() + (30 * 60 * 1000); // 30 minutos
                return {
                    success: false,
                    message: 'Muitas tentativas. Aguarde 30 minutos.'
                };
            }

            console.log('🔌 Conectando ao banco de dados...');

            // Conecta ao banco seguro
            const authInstance = new iTools();
            authInstance.initializeApp({
                projectId: "projects-manager" // Usa o mesmo banco do gerenciador
            });

            console.log('✅ Conectado ao banco. Buscando usuário...');

            try {
                // Busca as credenciais do super admin no banco
                const snapshot = await authInstance.database()
                    .collection(this.SUPER_ADMIN_COLLECTION)
                    .where({ email: username, active: true })
                    .get();

                console.log('📊 Resultado da busca:', {
                    encontrou: !!snapshot,
                    temDocs: !!(snapshot && snapshot.docs),
                    quantidadeDocs: snapshot?.docs?.length || 0
                });

                if (!snapshot || !snapshot.docs || snapshot.docs.length === 0) {
                    console.log('❌ Usuário não encontrado ou inativo!');
                    this.loginAttempts++;
                    const remaining = this.MAX_ATTEMPTS - this.loginAttempts;

                    authInstance.close();
                    return {
                        success: false,
                        message: `Credenciais inválidas. ${remaining} tentativas restantes.`
                    };
                }

                // Verifica a senha
                const superAdminDoc = snapshot.docs[0];
                console.log('📦 Documento completo:', superAdminDoc);
                console.log('🔍 Tentando acessar dados de diferentes formas:');
                console.log('   - superAdminDoc.data():', typeof superAdminDoc.data === 'function' ? superAdminDoc.data() : 'não é função');
                console.log('   - superAdminDoc._data:', superAdminDoc._data);
                console.log('   - superAdminDoc diretamente:', superAdminDoc);

                // Tenta diferentes formas de acessar os dados
                let userData = null;
                if (typeof superAdminDoc.data === 'function') {
                    userData = superAdminDoc.data();
                } else if (superAdminDoc._data) {
                    userData = superAdminDoc._data;
                } else {
                    userData = superAdminDoc;
                }

                console.log('👤 Dados do usuário extraídos:', userData);

                // Gera o hash da senha informada
                const passwordHash = CryptoJS.SHA256(password).toString();
                console.log('🔑 Hash SHA256 da senha digitada:', passwordHash);
                console.log('🔐 Hash salvo no banco:', userData?.passwordHash);

                // Compara usando SHA256
                console.log('🔓 Comparando com SHA256...');
                const senhaValida = passwordHash === userData.passwordHash;

                console.log('✅ Senha válida?', senhaValida);

                if (!userData || !senhaValida) {
                    console.log('❌ Senha incorreta ou dados não encontrados!');
                    this.loginAttempts++;
                    const remaining = this.MAX_ATTEMPTS - this.loginAttempts;

                    authInstance.close();
                    return {
                        success: false,
                        message: `Credenciais inválidas. ${remaining} tentativas restantes.`
                    };
                }

                // Verifica se a conta está ativa
                if (userData.active === false) {
                    console.log('❌ Conta desativada!');
                    authInstance.close();
                    return {
                        success: false,
                        message: 'Conta desativada. Entre em contato com o administrador.'
                    };
                }

                console.log('✅ Login autorizado! Atualizando último acesso...');

                // Pega o ID do documento corretamente
                const docId = superAdminDoc._id || superAdminDoc.id || (typeof superAdminDoc.id === 'object' ? superAdminDoc.id._id : null);
                console.log('📄 ID do documento para atualizar:', docId);

                // Registra o último acesso
                try {
                    await authInstance.database()
                        .collection(this.SUPER_ADMIN_COLLECTION)
                        .doc(docId.toString()) // Garante que é string
                        .update({
                            lastAccess: iTools.FieldValue.date("America/Sao_Paulo"),
                            lastAccessIP: await this.getClientIP()
                        });
                    console.log('✅ Último acesso atualizado!');
                } catch (updateError) {
                    console.error('⚠️ Erro ao atualizar último acesso:', updateError);
                    // Continua mesmo se falhar a atualização
                }

                authInstance.close();

                // Reset tentativas
                this.loginAttempts = 0;
                this.attemptResetTime = 0;

                // Cria sessão
                const session = {
                    username: username,
                    name: userData.name || 'Super Admin',
                    loginTime: new Date().getTime(),
                    expiresAt: new Date().getTime() + (2 * 60 * 60 * 1000), // 2 horas
                    token: this.generateToken(),
                    role: 'super_admin'
                };

                sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

                console.log('✅ Login realizado com sucesso!');
                console.log('🎉 Sessão criada:', session);

                return { success: true };

            } catch (error) {
                console.error('❌ Erro ao buscar credenciais:', error);
                authInstance.close();
                return {
                    success: false,
                    message: 'Erro ao verificar credenciais. Tente novamente.'
                };
            }

        } catch (error) {
            console.error('❌ Erro geral no login:', error);
            return { success: false, message: 'Erro ao processar login' };
        }
    }

    /**
     * Realiza o logout
     */
    async logout(): Promise<void> {
        sessionStorage.removeItem(this.SESSION_KEY);
        this.router.navigate(['/super-admin/login']);
    }

    /**
     * Verifica se está autenticado
     */
    isAuthenticatedSync(): boolean {
        const session = this.getSession();

        if (!session) {
            return false;
        }

        // Verifica expiração
        if (new Date().getTime() > session.expiresAt) {
            this.logout();
            return false;
        }

        // Verifica se é super admin
        if (session.role !== 'super_admin') {
            this.logout();
            return false;
        }

        return true;
    }

    /**
     * Verifica se está autenticado (assíncrono)
     */
    async isAuthenticated(): Promise<boolean> {
        return this.isAuthenticatedSync();
    }

    /**
     * Obtém a sessão
     */
    private getSession(): any {
        try {
            const sessionStr = sessionStorage.getItem(this.SESSION_KEY);
            return sessionStr ? JSON.parse(sessionStr) : null;
        } catch {
            return null;
        }
    }

    /**
     * Gera token único
     */
    private generateToken(): string {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36);
        return CryptoJS.SHA256(timestamp + random).toString();
    }

    /**
     * Obtém o IP do cliente (simulado)
     */
    private async getClientIP(): Promise<string> {
        try {
            // Em produção, você pode usar um serviço como ipify
            // const response = await fetch('https://api.ipify.org?format=json');
            // const data = await response.json();
            // return data.ip;
            return 'IP_NOT_AVAILABLE';
        } catch {
            return 'IP_ERROR';
        }
    }

    /**
     * Testa a conexão e lista todos os super admins (apenas para debug)
     */
    async testConnection(): Promise<void> {
        console.log('🧪 TESTE DE CONEXÃO COM O BANCO');
        console.log('================================');

        try {
            const authInstance = new iTools();
            authInstance.initializeApp({
                projectId: "projects-manager"
            });

            console.log('✅ Conectado ao banco projects-manager');

            // Busca todos os documentos da coleção SuperAdmins
            const snapshot = await authInstance.database()
                .collection(this.SUPER_ADMIN_COLLECTION)
                .get();

            console.log('📊 Total de documentos encontrados:', snapshot?.docs?.length || 0);
            console.log('📋 Estrutura do snapshot:', snapshot);

            if (snapshot && snapshot.docs && snapshot.docs.length > 0) {
                snapshot.docs.forEach((doc, index) => {
                    console.log(`\n📄 Documento ${index + 1}:`);
                    console.log('🔹 Documento completo:', doc);

                    // Tenta diferentes formas de acessar os dados
                    if (typeof doc.data === 'function') {
                        console.log('🔸 doc.data():', doc.data());
                    }
                    if (doc._data) {
                        console.log('🔸 doc._data:', doc._data);
                    }

                    // Tenta acessar propriedades diretamente
                    console.log('🔸 Propriedades diretas:', {
                        _id: doc._id,
                        email: doc.email,
                        name: doc.name,
                        active: doc.active,
                        passwordHash: doc.passwordHash ? `${doc.passwordHash.substring(0, 10)}...` : 'não encontrado'
                    });
                });
            }

            authInstance.close();
            console.log('\n✅ Teste concluído!');
            console.log('================================');

        } catch (error) {
            console.error('❌ Erro no teste:', error);
        }
    }
    async createInitialSuperAdmin(email: string, password: string, name: string): Promise<boolean> {
        try {
            const authInstance = new iTools();
            authInstance.initializeApp({
                projectId: "projects-manager"
            });

            // Verifica se já existe algum super admin
            const existing = await authInstance.database()
                .collection(this.SUPER_ADMIN_COLLECTION)
                .where({ role: 'super_admin' })
                .get();

            if (existing && existing.docs && existing.docs.length > 0) {
                console.error('Já existe um super admin cadastrado!');
                authInstance.close();
                return false;
            }

            // Cria o hash da senha
            const passwordHash = CryptoJS.SHA256(password).toString();

            // Salva no banco
            await authInstance.database()
                .collection(this.SUPER_ADMIN_COLLECTION)
                .doc(iTools.ObjectId())
                .set({
                    email: email,
                    passwordHash: passwordHash,
                    name: name,
                    role: 'super_admin',
                    active: true,
                    createdAt: iTools.FieldValue.date("America/Sao_Paulo"),
                    createdBy: 'SYSTEM_INIT'
                });

            authInstance.close();
            console.log('✅ Super Admin criado com sucesso!');
            return true;

        } catch (error) {
            console.error('Erro ao criar super admin:', error);
            return false;
        }
    }
}