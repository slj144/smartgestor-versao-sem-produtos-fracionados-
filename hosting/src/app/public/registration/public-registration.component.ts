// Arquivo: public-registration.component.ts
// Caminho: src/app/public/registration/public-registration.component.ts
// O que faz: Página pública de cadastro de clientes

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

// Serviços
import { PublicRegistrationService } from '@pages/crm/services/public-registration.service';
import { IToolsService } from '@shared/services/iTools.service';

// Utilities
import { FieldMask } from '@shared/utilities/fieldMask';
import { Utilities } from '@shared/utilities/utilities';
// import { DateTime } from '@shared/utilities/dateTime';

// Tipos já existentes no projeto
type EPersonType = 'naturalPerson' | 'legalPerson';

@Component({
    selector: 'app-public-registration',
    templateUrl: './public-registration.component.html',
    styleUrls: ['./public-registration.component.scss']
})
export class PublicRegistrationComponent implements OnInit {

    // ID do tenant (empresa) que vem na URL
    public tenantId: string = '';

    // Informações da empresa
    public tenantInfo: any = null;

    // Configurações do formulário
    public formSettings: any = null;

    // Formulário de cadastro
    public registrationForm: FormGroup;

    // Estados de controle
    public loading: boolean = true;
    public submitting: boolean = false;
    public submitted: boolean = false;
    public hasError: boolean = false;
    public errorMessage: string = '';
    public searchingCep: boolean = false;

    // Ano atual para o footer
    public currentYear: number = new Date().getFullYear();


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private publicRegistrationService: PublicRegistrationService,
        private iToolsService: IToolsService
    ) { }

    ngOnInit(): void {
        console.log('🚀 Página de cadastro público iniciada');

        // Pega o ID do tenant da URL
        const currentUrl = window.location.pathname;
        const urlParts = currentUrl.split('/').filter(Boolean);

        // Suporta os formatos:
        //  - /registro/<tenantId>
        //  - /<tenantId>/registro-publico (legado)
        this.tenantId = urlParts[0] === 'registro' ? urlParts[1] : urlParts[0];

        console.log('📋 Tenant identificado:', this.tenantId);

        // Carrega as informações
        this.loadPageData();
    }

    /**
     * Carrega todas as informações necessárias
     */
    private async loadPageData(): Promise<void> {
        try {
            console.log('📋 Carregando dados do tenant:', this.tenantId);

            // Valida se o tenant pode usar o sistema
            const isValid = await this.publicRegistrationService.validateTenantAccess(this.tenantId);

            if (!isValid) {
                this.showError('Este link não está mais disponível ou a empresa não possui acesso ao sistema.');
                return;
            }

            // Busca informações do tenant
            this.tenantInfo = await this.publicRegistrationService.getTenantInfo(this.tenantId);
            console.log('🏢 Informações do tenant carregadas:', {
                name: this.tenantInfo?.name
            });

            // Atualiza o título da página com o nome da empresa
            document.title = `Cadastre-se - ${this.tenantInfo?.name || 'Nossa Empresa'}`;

            // Busca configurações do formulário
            this.formSettings = await this.publicRegistrationService.getFormSettings();

            // Atualiza metadados da página com nome e logo da empresa
            this.setPageMetadata();

            // Força o TELEFONE como obrigatório sempre (para controle de desconto único)
            this.formSettings.fields.phone.required = true;

            // Cria o formulário
            this.createForm();

            this.loading = false;

        } catch (error) {
            console.error('❌ Erro ao carregar página:', error);
            this.showError('Ocorreu um erro ao carregar a página. Tente novamente.');
        }
    }

    /**
     * Cria o formulário baseado nas configurações
     */
    private createForm(): void {
        const fields = this.formSettings.fields;

        // Cria os campos do formulário dinamicamente
        const formControls: any = {};

        // Nome (sempre obrigatório)
        if (fields.name.show) {
            formControls.name = ['', fields.name.required ? Validators.required : []];
        }

        // E-mail
        if (fields.email.show) {
            const validators = [];
            if (fields.email.required) validators.push(Validators.required);
            validators.push(Validators.email);
            formControls.email = ['', validators];
        }

        // Telefone - SEMPRE OBRIGATÓRIO com validação
        if (fields.phone.show) {
            const validators = [Validators.required, Validators.minLength(14)]; // (00) 00000-0000
            formControls.phone = ['', validators];
        }

        // CPF
        if (fields.cpf.show) {
            const validators = [];
            if (fields.cpf.required) validators.push(Validators.required);
            validators.push(Validators.minLength(14)); // 000.000.000-00
            formControls.cpf = ['', validators];
        }

        // Data de nascimento
        if (fields.birthDate.show) {
            formControls.birthDate = ['', fields.birthDate.required ? Validators.required : []];
        }

        // Endereço (grupo de campos)
        if (fields.address.show) {
            formControls.address = this.formBuilder.group({
                postalCode: [''],
                local: [''],
                number: [''],
                complement: [''],
                neighborhood: [''],
                city: [''],
                state: ['']
            });
        }

        // Cria o formulário
        this.registrationForm = this.formBuilder.group(formControls);
    }

    /**
     * Máscaras para os campos
     */
    public applyPhoneMask(event: any): void {
        const value = event.target.value;
        event.target.value = FieldMask.phoneFieldMask(value);
    }

    public applyCpfMask(event: any): void {
        const input = event.target;
        const value = input.value;

        // Aplica a máscara
        const maskedValue = FieldMask.cpfFieldMask(value);

        // Atualiza o valor do input
        input.value = maskedValue;

        // IMPORTANTE: Força o Angular a detectar a mudança
        this.registrationForm.get('cpf')?.setValue(maskedValue);
        this.registrationForm.get('cpf')?.updateValueAndValidity();

        // Dispara evento de mudança para garantir que o formulário seja atualizado
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    public applyPostalCodeMask(event: any): void {
        const input = event.target;
        const value = input.value;

        // Aplica a máscara
        const maskedValue = FieldMask.postalCodeFieldMask(value);

        // Atualiza o valor do input
        input.value = maskedValue;

        // IMPORTANTE: Força o Angular a detectar a mudança
        const addressGroup = this.registrationForm.get('address');
        if (addressGroup) {
            addressGroup.get('postalCode')?.setValue(maskedValue);
            addressGroup.get('postalCode')?.updateValueAndValidity();
        }

        // Dispara evento de mudança
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    //

    /**
     * Busca endereço pelo CEP
     */
    public async searchAddress(): Promise<void> {
        const postalCode = this.registrationForm.get('address.postalCode')?.value;

        if (!postalCode || postalCode.length < 9) return;

        this.searchingCep = true;

        try {
            // Remove máscara
            const cleanCep = postalCode.replace(/\D/g, '');

            // Busca o endereço
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                // Preenche os campos
                this.registrationForm.patchValue({
                    address: {
                        local: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            this.searchingCep = false;
        }
    }

    /**
 * Envia o formulário
 */
    public async onSubmit(): Promise<void> {
        // Marca todos os campos como tocados para mostrar erros
        this.registrationForm.markAllAsTouched();

        // Verifica se o formulário é válido
        if (!this.registrationForm.valid) {
            return;
        }

        this.submitting = true;

        try {
            // Lista para armazenar erros
            const errors: string[] = [];

            // Verifica se o TELEFONE já existe
            if (this.registrationForm.get('phone')?.value) {
                const cleanPhone = this.registrationForm.get('phone').value.replace(/\D/g, '');
                const phoneExists = await this.publicRegistrationService.checkPhoneExists(cleanPhone, this.tenantId);

                if (phoneExists) {
                    this.registrationForm.get('phone')?.setErrors({ phoneAlreadyExists: true });
                    errors.push('❌ Telefone já cadastrado!');
                }
            }

            // Verifica se o CPF já existe (se foi preenchido)
            if (this.registrationForm.get('cpf')?.value) {
                const cleanCpf = this.registrationForm.get('cpf').value.replace(/\D/g, '');
                const cpfExists = await this.publicRegistrationService.checkCpfExists(cleanCpf, this.tenantId);

                if (cpfExists) {
                    this.registrationForm.get('cpf')?.setErrors({ cpfAlreadyExists: true });
                    errors.push('❌ CPF já cadastrado!');
                }
            }

            // Se houver erros, mostra mensagem e não continua
            if (errors.length > 0) {
                this.submitting = false;

                // Mostra mensagem detalhada
                //let message = 'Não foi possível realizar o cadastro:\n\n';
                // message += errors.join('\n');
                // message += '\n\n📌 Cada pessoa pode se cadastrar apenas uma vez.';

                // alert(message);
                return;
            }

            // Prepara os dados do cliente no formato do projeto
            const customerData: any = {
                name: this.registrationForm.get('name')?.value || '',
                type: 'naturalPerson' as EPersonType,
                contacts: {
                    email: this.registrationForm.get('email')?.value || '',
                    phone: this.registrationForm.get('phone')?.value || ''
                }
            };

            // CPF (se existir)
            if (this.registrationForm.get('cpf')?.value) {
                customerData.personalDocument = {
                    type: 'CPF',
                    value: this.registrationForm.get('cpf').value
                };
            }

            // Data de nascimento (se existir)
            if (this.registrationForm.get('birthDate')?.value) {
                customerData.birthDate = this.registrationForm.get('birthDate').value;
            }

            // Endereço (se existir)
            if (this.registrationForm.get('address')?.value) {
                const addressForm = this.registrationForm.get('address').value;
                customerData.address = {
                    postalCode: addressForm.postalCode || '',
                    local: addressForm.local || '',
                    number: addressForm.number || '',
                    complement: addressForm.complement || '',
                    neighborhood: addressForm.neighborhood || '',
                    city: addressForm.city || '',
                    state: addressForm.state || '',
                    country: 'BR'
                };
            }

            // Envia para o servidor
            await this.publicRegistrationService.registerPublicCustomer(customerData);

            // Mostra mensagem de sucesso
            this.submitted = true;
            this.submitting = false;

            console.log('✅ Cadastro realizado com sucesso!');

        } catch (error: any) {
            console.error('❌ Erro ao cadastrar:', error);
            this.submitting = false;

            // Verifica mensagens de erro específicas
            if (error.message?.includes('Telefone já cadastrado')) {
                this.registrationForm.get('phone')?.setErrors({ phoneAlreadyExists: true });
                // alert('❌ Este telefone já foi cadastrado!\n\nCada pessoa pode se cadastrar apenas uma vez.');
            } else if (error.message?.includes('CPF já cadastrado')) {
                this.registrationForm.get('cpf')?.setErrors({ cpfAlreadyExists: true });
                // alert('❌ Este CPF já foi cadastrado!\n\nCada pessoa pode se cadastrar apenas uma vez.');
            } else {
                this.showError('Ocorreu um erro ao realizar o cadastro. Tente novamente.');
            }
        }
    }

    /**
     * Mostra mensagem de erro
     */
    private showError(message: string): void {
        this.hasError = true;
        this.errorMessage = message;
        this.loading = false;
    }


    /**
     * Volta para o início (recarrega a página)
     */
    public resetForm(): void {
        window.location.reload();
    }

    /**
     * Atualiza título da página e favicon com dados do tenant
     */
    private setPageMetadata(): void {
        if (this.tenantInfo?.name) {
            document.title = `${this.tenantInfo.name} - Cadastro`;
        }

        if (this.tenantInfo?.logo) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'shortcut icon';
                document.head.appendChild(link);
            }
            link.type = 'image/png';
            link.href = this.tenantInfo.logo;
        }
    }

}
