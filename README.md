# simandu-refonte

# Comment créer une fonctionnalité dans l'application

Dans authenticated :

1) créer fichier :  localites/index.tsx  (la route se crée automatiquement)

```
── routes
│   │   ├── _authenticated
│   │   │   ├── localites
│   │   │   │   └── index.tsx
```

2) Dans SIMADOU :
   Dans allfonctionalities, on part de l'exemple de users, vous créez un autre dossier : localités qui contiendra tous les composants (fichiers necessaires)

```
── simadou
│   │   ├── allfonctionalities
│   │   │   └── users
│   │   │       ├── AddUser.tsx
│   │   │       ├── EditUser.tsx
│   │   │       └── ListeUsers.tsx
```

3) Revenir dans la route crée au niveau de _authenticated puis :

```js
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/parametrage/localites/')({
  component: RouteComponent,
})

// c'est uniquement cette partie qu'il faut changer
function RouteComponent() {
  return <div>Hello "/_authenticated/parametrage/localites/"!</div>
}
```

comme suit (on se base sur : #user)

```js
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddUser from '@/simadou/allfonctionalities/users/AddUser'
import ListeUsers from '@/simadou/allfonctionalities/users/ListeUsers'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
  // route géneric
    <PageRouteLayout
    // titre qui va s'affichier sur le tableau des users
      title="Listes utilisateurs"
      // icons du bouton d'ajout
      icon={Users}
      // le modal du formulaire d'ajout
      addDialogComponent={AddUser}
      // la liste des utilisateurs affichers dans le tableau
      listComponent={ListeUsers}
    />
  )
}
```

4) Ajout de la route de la fonctionnalité crée
   Dans #sidebar-data.ts  il y a toutes les routes

```
├── simadou
│   │   ├── routescontantes
│   │   │   └── sidebar-data.ts
```

```js
import {
  LayoutDashboard,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../../components/layout/others/types'

export const sidebarData: SidebarData = {
  user: {
    name: 'simadou',
    email: 'simadou.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'SIMADOU',
      logo: Command,
      plan: 'simadou',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },

        // ── Paramétrage ──────────────────────────────────────
        {
          title: 'Paramétrage',
          icon: Settings,
          items: [
          // ajout de la locatité
            {
              title: 'Localités',
              url: '/localites',
              icon: MapPin,
            },
          ],
        },
      ],
    },
}
```

# Comment manipuler le formulaire

Partons de l'exemple du formulaire d'ajout d'un utilisateur

1) Formulaire d'ajout d'utilisateur

```js

// ici y a les importes que j'ai effacé

const AddUser = ({ open, onOpenChange }: OpenProps) => {
  const { mutate, isPending } = useAddUser();
  const formConfig = getUserFormConfig()

  const onSubmit = () => {
    mutate(data, {
       onSuccess: () => {
         onOpenChange(false);
       },
     });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.md}>
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogDescription>Créer un nouvel utilisateur</DialogDescription>
        </DialogHeader>
        <DynamicForm
        //1a) config des champs
          config={formConfig}
        //1b) configuration de zod 
          schema={userSchema}
        //1c) configuration des champs de renitialisation
          defaultValues={STAFF}
  
          onSubmit={onSubmit}
          submitText="Ajouter l'utilisateur"
          loadingText='Ajout en cours...'
        />
      </DialogContent>
    </Dialog>
  )
}

export default AddUser
```

### Regardons de plus prêt

### 1a) Config des champs

Donc ici comme prévu chacun créera un fichier correspondant a la classe qu'il voudra manipuler

```
├── simadou
│   │   ├── allfieldsConfig
│   │   │   └── userFormConfig.ts
```

Dans userFormConfig.ts

### Ce premier cas concerne que le DynamicForm

```js
import type { FormConfig } from "../../Global/types/formConfig";
export const getUserFormConfig = (): FormConfig => ({
  // premier cas


  //----------------------
  fields: [
    // text
    {
      name: "nom",
      label: "Nom",
      type: "text",
      placeholder: "Nom de famille",
      required: true,
      gridCols:1,
    },
  ],
});
```

### Ce deuxième cas concerne le StepDynamicForm

```js
import type { FormConfig } from "../../Global/types/formConfig";
export const getUserFormConfig = (): FormConfig => ({
  // 2eme cas

  // vous definissez le nombre de step ici
   steps: [
     {
       step: 1,
       title: "Identité",
       description: "Informations personnelles de base",
     },
   ],

  // et vous associez chaque champ à un step

  // fields: [
  //   // ── Step 1 : Identité ────────────────────────────────────────
     {
       name: "nom",
       label: "Nom",
       type: "text",
       placeholder: "Ex: Diallo",
       required: true,
       gridCols: 1,
       formStep: 1,
     },
  ],
});
```

### Gestion des select (question posée hier pendant la présentation)

prenons juste un exemple (elèves et matière)

```js
import type { FormConfig } from "";

export const getAbsenceFormConfig = (
// on passe en paramètres ici les eleves et matieres
  eleves: any[] = [],
  matieres: any[] = [],
  
): FormConfig => ({
  fields: [
    {
      name: "eleveId",
      label: "Élève",
      type: "select",
      placeholder: "Sélectionner un élève (optionnel)",
      required: false,
      options: eleves.map((eleve) => ({
        value: eleve.id,
        label: `${eleve.nom} ${eleve.prenom}`,
      })),
    },
    {
      name: "matiereId",
      label: "Matière",
      type: "select",
      placeholder: "Sélectionner une matière",
      required: true,
      options: matieres.map((matiere) => ({
        value: matiere.id,
        label: matiere.libelle,
      })),
    },
  ],
});
```

### 1b) Gestion du champs de validation (zod)

Chacun viendra donc dans schemas créer propres schemas

```
├── simadou
│   │   └── schemas
│   │       └── allSchema.ts
```

### 1c) configuration des champs de renitialisation

sa ce fais ici donc

```
├── simadou
│   │   ├── allResetFields
│   │   │   └── resetField.ts
```

exemple :

### Interface

```js
//====================Absence======================
export interface Absence {
  id: number;
  dateDebut: string;
  dateFin: string;
  motif: string;
  justification: boolean;
  eleveId: number | null;
  staffId: number | null;
  matiereId: number;
  classeId: number;
  eleve?: Eleve | null;
  staff?: Staff | null;
  matiere?: Matiere;
  classe?: Classe;
}

export interface AbsenceForm {
  dateDebut: string;
  dateFin: string;
  motif: string;
  justification: boolean;
  eleveId: number | null;
  staffId: number | null;
  matiereId: number;
  classeId: number;
}
```

### reset fields

```js
//==========absence==================
export const ABSENCE: AbsenceFormSchema = {
  dateDebut: "",
  dateFin: "",
  motif: "",
  justification: false,
  eleveId: 0,
  matiereId: 0,
  classeId: 0,
};
```

### zod

```js
//================= AbsenceForm =================//
export const absenceFormSchema = z.object({
  dateDebut: z.string().min(1, "La date de début est obligatoire"),
  dateFin: z.string().min(1, "La date de fin est obligatoire"),
  motif: z.string().min(3, "Le motif doit contenir au moins 3 caractères"),
  justification: z.boolean().default(false),
  eleveId: z.coerce.number().positive("L'élève est obligatoire"),
  matiereId: z.coerce.number().positive("La matière est obligatoire"),
  classeId: z.coerce.number().positive("La classe est obligatoire"),
});
export type AbsenceFormSchema = z.infer<typeof absenceFormSchema>;
```

### Formulaire

ici comme le formulaire d'absence est trop long je vais juste prend un autre exemple et expliquer ici

```js
const AddUser = ({ open, onOpenChange }: OpenProps) => {
// le mutate pour la création d'un user
  const { mutate, isPending } = useAddUser();
  
// mais avant il faut recupérer les roles (qui seront dans un champs select)
  const { data: listesRoles } = useGetRoles();

// ici on avait dans le allfieldsconfig (passer l'object en paramètre)
  const formConfig = getUserFormConfig(listesRoles || []);

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    //------------
    </Dialog>
  );
};

export default AddUser;
```

# Gestion des hooks pour chaque fonctionnalité (contacter des apis)

### 1) Manipulation d'un hook simple

```js
import { axiosInstance } from "@/axios/axiosInstance";
import type { ProduitLocal, ProduitLocalForm } from "@/interfaces/interfaceTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {toast} from "sonner";

//========================CRUD PRODUITS LOCAUX========================

export const useAddProduitLocal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProduitLocalForm) => {
      const res = await axiosInstance.post("/produit", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Produit local ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["produitsLocaux"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du produit local");
    },
  });
};

export const useGetProduitsLocaux = () => {
  return useQuery<ProduitLocal[]>({
    queryKey: ["produitsLocaux"],
    queryFn: async () => {
      const res = await axiosInstance.get("/produit");
      return res.data;
    },
  });
};

export const useGetProduitLocalById = (id: number) => {
  return useQuery<ProduitLocal>({
    queryKey: ["produitsLocaux", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/produit/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useGetProduitsBySpeculation = (idSpeculation: number) => {
  return useQuery<ProduitLocal[]>({
    queryKey: ["produitsLocaux", "speculation", idSpeculation],
    queryFn: async () => {
      const res = await axiosInstance.get(`/produit/speculation/${idSpeculation}`);
      return res.data;
    },
    enabled: !!idSpeculation,
  });
};

export const useUpdateProduitLocal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProduitLocalForm }) => {
      const res = await axiosInstance.put("/produit/${id}", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Produit local mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["produitsLocaux"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
};

export const useDeleteProduitLocal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.delete(`/produit/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Produit local supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["produitsLocaux"] });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
};
```

### 2) Manipulation de hook Generic

* [ ]  ETAT DE CHARGEMENT (GENERIC AU NIVEAU DU DATABASE ET REUTILISABLE)

Pour ce faire il y a trois choses a faire très simple.

1) S'assurez dans le tableau qu'on manipule qu'on n'a pas ajouter une animation ou animation manuell
2) Prenons exemple sur le composant : ListePtba.tsx
   Dans ce composant on doit appéler les données pour les affichées, donc dans le corps de la requêtte ajouter : isLoading

```js
//isLoading extrait de  NavigationProgress global s'en charge visuellement
  const { data: ptbas = [], isLoading } = useGetPtbas()
```

### Puisque "Ptba" hérite du GenericTable alors ajouter donc isLoading

```js
 <GenericTable<Ptba>
        data={filteredPtbas}
        columns={columns}
        search={search}
        navigate={navigate}
      
        isLoading={isLoading} // ✅ déclenche NavigationProgress global
```

c'est tout.......
