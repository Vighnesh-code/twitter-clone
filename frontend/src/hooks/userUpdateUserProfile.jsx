import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        try {
          const res = await fetch(`/api/users/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Something Went Wrong");
          return data;
        } catch (error) {
          throw new Error(error);
        }
      },
      onSuccess: () => {
        toast.success("Profile Updated Successfully!");
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        ]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
