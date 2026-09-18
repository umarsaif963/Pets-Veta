import PetOwnerProfilePage from "./pages/PetOwnerProfilePage";
import PetFormPage from "../pet details/pages/PetFormPage";
import EditPetPage from "./pages/EditPetPage";
import { ProtectedRoutes } from "@/ProtectedRoutes/ProtectedRoutes";

export const petProfileRoutes = [
  {
    path: "/pet-owner/profile",
    element: (
      <ProtectedRoutes>
        <PetOwnerProfilePage initialSection="profile" />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/pet-owner/my-pets",
    element: (
      <ProtectedRoutes>
        <PetOwnerProfilePage initialSection="pets" />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/pet-owner/pets/add",
    element: (
      <ProtectedRoutes>
        <PetFormPage />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/pet-owner/pets/:petId/edit",
    element: (
      <ProtectedRoutes>
        <EditPetPage />
      </ProtectedRoutes>
    ),
  },
];