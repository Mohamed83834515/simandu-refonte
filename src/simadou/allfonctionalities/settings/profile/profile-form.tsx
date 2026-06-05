
import { BadgeCheck, Briefcase, Building2, Dna, KeyRound, LucideIcon, Mail, MapPin, PencilIcon, Phone, UserCog } from 'lucide-react'
import { useState } from 'react'
import EditFieldDialog from './EditFieldDialog'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { formatDate } from '@/lib/utils'

export type EditableField =
  | "title"
  | "telephone"
  | "region"
  | "password";



export function ProfileForm() {
 

  const {data : personnel} = useMe()
  const [openedDialog, setOpenedDialog] = useState<EditableField | null>(null)

  const details : {key:string,label : string, icon : LucideIcon, value : string, isEditable : boolean}[] = [
    {
      label: "Nom complet",
      value: `${personnel?.prenom_perso || ""} ${
        personnel?.nom_perso || ""
      }`,
      icon: UserCog,
      isEditable : false,
      key :"name"
    },

    {
      label: "Adresse email",
      value: personnel?.email || "Non renseigné",
      icon: Mail,
       isEditable : false,
        key :"email"
    },
     {
      label: "Titre",
      value: personnel?.titre_personnel?.libelle_titre || "Non renseigné",
      icon: Dna,
       isEditable : true,
        key :"title"
    },


    {
      label: "Téléphone",
      value: personnel?.contact_perso || "Non renseigné",
      icon: Phone,
       isEditable : true,
        key :"telephone"
    },

    {
      label: "Fonction",
      value: personnel?.fonction_perso?.nom_fonction ||
        "Non renseigné",
      icon: Briefcase,
       isEditable : false,
        key :"function"
    },

    {
      label: "Service",
      value: `${personnel?.service_perso?.intutile_ds} (${personnel?.service_perso?.code_ds})` ||
        "Non renseigné",
      icon: Building2,
       isEditable : false,
        key :"service"
    },

    {
      label: "Structure",
      value: personnel?.structure_perso?.nom_acteur ||
        "Non renseigné",
      icon: BadgeCheck,
      isEditable : false,
       key :"structure"
    },

    {
      label: "Région",
      value: personnel?.region_perso?.intitule_loca ||
        "Non renseigné",
      icon: MapPin,
      isEditable : true,
       key :"region"
    },

    {
      label: "Mot de passe",
      value: `Dernière modification le ${formatDate(new Date(personnel!.password_last_modified))}`,
      icon:KeyRound,
       isEditable : true,
        key :"password"
    },

  ];

  // const { fields, append } = useFieldArray({
  //   name: 'urls',
  //   control: form.control,
  // })

  return (
       <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
        

       <div className="grid grid-cols-1 gap-4  md:grid-cols-3 py-4 px-6">
  {details.map((detail) => {
    const Icon = detail.icon;

    return (
      <div
        key={detail.label}
        className="
          group
          relative
          flex items-start gap-4
          rounded-2xl border
          p-5
          transition-colors
          hover:bg-muted/40
        "
      >
        {/* ICON */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            {detail.label}
          </p>

          <p className="mt-1 text-sm font-medium break-words">
            {detail.value}
          </p>
        </div>

        {/* EDIT ACTION */}
        {detail.isEditable && (
          <button
            type="button"
            className="
              opacity-0
              group-hover:opacity-100
              transition-opacity
              flex h-9 w-9 items-center justify-center
              rounded-lg
              hover:bg-primary/10
              text-muted-foreground
              hover:text-primary
            "
            onClick={() => setOpenedDialog(detail.key as EditableField)}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  })}

    <EditFieldDialog
        open={openedDialog !== null}
        field={openedDialog}
        onClose={() => setOpenedDialog(null)}
      />
</div>
        </div>
  )
}
