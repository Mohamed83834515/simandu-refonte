import type { FormConfig } from "../../Global/types/formConfig";

export const getSetPasswordFormConfig = (): FormConfig => ({

    fields: [
       
        {
            name: "newPassword",
            label: "Nouveau mot de passe",
            type: "password",
            placeholder: "********",
            required: true,
            gridCols: 1,
            showPasswordToggle : true,
            showPasswordChecker : true
        },
       
      

          {
            name: "confirm",
            label: "Confirmation du nouveau mot de passe",
            type: "password",
            placeholder: "********",
            required: true,
            gridCols: 1,
             showPasswordToggle : true
        },
    ]

})