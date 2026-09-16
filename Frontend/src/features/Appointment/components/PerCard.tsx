// PetCard.tsx
import { PawPrint } from "lucide-react";
import Button from "@/shared/components/Button/Button";

interface PetCardProps {
    id: string;
    name: string;
    breed?: string;
    age?: string | number;
    photos?: any[]; // Dynamic handling for the photo array from backend
    photoUrl?: string;
    onSelect: (name: string, photoUrl: string | undefined, id: string) => void;
}

const PetCard = ({ id, name, breed, age, photos, photoUrl, onSelect }: PetCardProps) => {

    const resolvePhotoUrl = (): string | undefined => {
        if (photos && photos.length > 0) {
            const firstPhoto = photos[0];
            if (typeof firstPhoto === "string") return firstPhoto;
            if (typeof firstPhoto === "object" && firstPhoto !== null) {
                if ("url" in firstPhoto) {
                    return (firstPhoto as { url: string }).url;
                }
                if ("publicUrl" in firstPhoto) {
                    return (firstPhoto as { publicUrl: string }).publicUrl; // Resolve DB publicUrl
                }
            }
        }
        return photoUrl;
    };

    const currentPhotoUrl = resolvePhotoUrl();

    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-purple-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-purple-200">
            <div className="flex items-center gap-4">
                {/* Pet Image Frame */}
                {currentPhotoUrl ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-purple-100">
                        <img
                            src={currentPhotoUrl}
                            alt={name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F6F0FF] text-[#6D3DD9]">
                        <PawPrint size={24} />
                    </div>
                )}

                {/* Pet Info */}
                <div>
                    <h4 className="text-base font-black text-slate-800">{name}</h4>
                    {breed && age !== undefined && (
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            {breed} • {age} {Number(age) === 1 ? "Year" : "Years"} old
                        </p>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <Button
                type="button"
                variant="outline"
                onClick={() => onSelect(name, currentPhotoUrl, id)}
                className="px-4 py-2 text-xs font-bold border-[#6D3DD9]/35 text-[#6D3DD9] hover:bg-[#6D3DD9] hover:text-white transition-all rounded-xl"
            >
                Select
            </Button>
        </div>
    );
};

export default PetCard;