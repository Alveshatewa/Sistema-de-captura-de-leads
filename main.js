class LeadCaptureApp {
    constructor() {
        this.supabaseUrl = ' https://holkeecziefrxraaeagx.supabase.co/rest/v1/Leads';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbGtlZWN6aWVmcnhyYWFlYWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDk3MTksImV4cCI6MjA2NzgyNTcxOX0.-iaWJlYD4Sby1Yv1t4_braHLIaWOpkka-piYr4zMBrQ';
        
        this.form = document.getElementById('leadForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.successMessage = document.getElementById('successMessage');
        this.errorAlert = document.getElementById('errorAlert');
        this.errorText = document.getElementById('errorText');
        
        this.inputs = {
            nome: document.getElementById('nome'),
            ddd: document.getElementById('ddd'),
            telefone: document.getElementById('telefone')
        };
        
        this.errorElements = {
            nome: document.getElementById('nomeError'),
            telefone: document.getElementById('telefoneError')
        };
        
        this.init();
    }
    
    init() {
        this.addEventListeners();
        this.setupInputMasks();
    }
    
    addEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validação em tempo real
        this.inputs.nome.addEventListener('blur', () => this.validateName());
        this.inputs.ddd.addEventListener('blur', () => this.validatePhone());
        this.inputs.telefone.addEventListener('blur', () => this.validatePhone());
        
        // Limpar erros ao digitar
        Object.values(this.inputs).forEach(input => {
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    setupInputMasks() {
        // Máscara para DDD - apenas números
        this.inputs.ddd.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 2);
        });
        
        // Máscara para telefone - formato 99999-9999 ou 9999-9999
        this.inputs.telefone.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 8) {
                // Formato: 9999-9999
                value = value.replace(/(\d{4})(\d{1,4})/, '$1-$2');
            } else {
                // Formato: 99999-9999
                value = value.replace(/(\d{5})(\d{1,4})/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
    
    validateName() {
        const name = this.inputs.nome.value.trim();
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;
        
        if (!name) {
            this.showFieldError('nome', 'Nome é obrigatório');
            return false;
        }
        
        if (!nameRegex.test(name)) {
            this.showFieldError('nome', 'Nome deve conter apenas letras e ter entre 2 e 50 caracteres');
            return false;
        }
        
        this.clearFieldError(this.inputs.nome);
        return true;
    }
    
    validatePhone() {
        const ddd = this.inputs.ddd.value.trim();
        const telefone = this.inputs.telefone.value.replace(/\D/g, '');
        
        if (!ddd || !telefone) {
            this.showFieldError('telefone', 'DDD e telefone são obrigatórios');
            return false;
        }
        
        if (ddd.length !== 2) {
            this.showFieldError('telefone', 'DDD deve ter 2 dígitos');
            return false;
        }
        
        if (telefone.length < 8 || telefone.length > 9) {
            this.showFieldError('telefone', 'Telefone deve ter 8 ou 9 dígitos');
            return false;
        }
        
        // Validar DDD válido (11-99)
        const dddNum = parseInt(ddd);
        if (dddNum < 11 || dddNum > 99) {
            this.showFieldError('telefone', 'DDD inválido');
            return false;
        }
        
        this.clearFieldError(this.inputs.telefone);
        return true;
    }
    
    showFieldError(field, message) {
        const input = field === 'telefone' ? this.inputs.telefone : this.inputs[field];
        const errorElement = this.errorElements[field];
        
        input.classList.add('error');
        input.classList.remove('success');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    clearFieldError(input) {
        input.classList.remove('error');
        
        // Encontrar o elemento de erro correspondente
        let errorElement;
        if (input === this.inputs.nome) {
            errorElement = this.errorElements.nome;
        } else if (input === this.inputs.ddd || input === this.inputs.telefone) {
            errorElement = this.errorElements.telefone;
        }
        
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }
    
    setValidFieldState(input) {
        input.classList.remove('error');
        input.classList.add('success');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar todos os campos
        const isNameValid = this.validateName();
        const isPhoneValid = this.validatePhone();
        
        if (!isNameValid || !isPhoneValid) {
            return;
        }
        
        // Marcar campos como válidos
        this.setValidFieldState(this.inputs.nome);
        this.setValidFieldState(this.inputs.telefone);
        
        // Preparar dados
        const leadData = this.prepareLeadData();
        
        // Enviar dados
        await this.submitLead(leadData);
    }
    
    prepareLeadData() {
        const nome = this.inputs.nome.value.trim();
        const ddd = this.inputs.ddd.value.trim();
        const telefone = this.inputs.telefone.value.replace(/\D/g, '');
        
        return {
            nome: nome,
            telefone: `(${ddd}) ${this.formatPhoneNumber(telefone)}`
        };
    }
    
    formatPhoneNumber(phone) {
        if (phone.length === 8) {
            return phone.replace(/(\d{4})(\d{4})/, '$1-$2');
        } else if (phone.length === 9) {
            return phone.replace(/(\d{5})(\d{4})/, '$1-$2');
        }
        return phone;
    }
    
    async submitLead(leadData) {
        this.setLoadingState(true);
        
        try {
            const response = await fetch(this.supabaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey,
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(leadData)
            });
            
            if (response.ok) {
                this.showSuccessMessage();
                this.resetForm();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Erro na resposta:', response.status, errorData);
                this.showErrorMessage('Erro ao cadastrar. Verifique os dados e tente novamente.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }
    
    showSuccessMessage() {
        this.successMessage.classList.add('show');
        
        // Remover mensagem após 4 segundos
        setTimeout(() => {
            this.successMessage.classList.remove('show');
        }, 4000);
    }
    
    showErrorMessage(message) {
        this.errorText.textContent = message;
        this.errorAlert.classList.add('show');
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            this.errorAlert.classList.remove('show');
        }, 5000);
    }
    
    resetForm() {
        this.form.reset();
        
        // Limpar classes de validação
        Object.values(this.inputs).forEach(input => {
            input.classList.remove('error', 'success');
        });
        
        // Limpar mensagens de erro
        Object.values(this.errorElements).forEach(errorElement => {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        });
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LeadCaptureApp();
});