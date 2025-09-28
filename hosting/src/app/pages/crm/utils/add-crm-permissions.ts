// Arquivo: add-crm-permissions.ts
// Localização: src/app/pages/crm/utils/add-crm-permissions.ts
// Componente: Utilitário para adicionar permissões do CRM

import { IToolsService } from '@shared/services/iTools.service';
import { Utilities } from '@shared/utilities/utilities';

export class AddCrmPermissions {

    // Método para adicionar permissões do CRM a um usuário específico
    static async addToUser(
        iToolsService: IToolsService,
        userId: string,
        permissions: {
            actions: string[],
            modules: string[],
            fields?: string[]
        }
    ) {
        try {
            const userRef = iToolsService.database()
                .collection('Users')
                .doc(userId);

            const userDoc = await userRef.get();

            // O método get() em um documento retorna um DocumentSnapshot, por
            // isso devemos verificar a flag `exists` ao invés de `docs`.
            if (userDoc.exists) {
                const userData = userDoc.data();

                // Adicionar permissões do CRM
                if (!userData.permissions) {
                    userData.permissions = {};
                }

                userData.permissions.crm = permissions;

                // Atualizar usuário
                await userRef.update({
                    permissions: userData.permissions
                });

                console.log('Permissões do CRM adicionadas com sucesso!');
                return true;
            }

            console.error('Usuário não encontrado');
            return false;

        } catch (error) {
            console.error('Erro ao adicionar permissões:', error);
            return false;
        }
    }

    // Método para adicionar permissões padrão do CRM para todos os usuários de um tenant
    static async addToAllUsersInTenant(
        iToolsService: IToolsService,
        tenantId: string,
        defaultPermissions: any
    ) {
        try {
            const usersRef = iToolsService.database()
                .collection('Users')
                .where([
                    { field: 'owner', operator: '=', value: tenantId }
                ]);

            const users = await usersRef.get();
            const batch = iToolsService.database().batch();

            for (const doc of users.docs) {
                const userData = doc.data();

                if (!userData.permissions) {
                    userData.permissions = {};
                }

                userData.permissions.crm = defaultPermissions;

                batch.update(
                    iToolsService.database().collection('Users').doc(userData._id),
                    { permissions: userData.permissions }
                );
            }

            await batch.commit();
            console.log('Permissões adicionadas para todos os usuários do tenant');
            return true;

        } catch (error) {
            console.error('Erro:', error);
            return false;
        }
    }
}