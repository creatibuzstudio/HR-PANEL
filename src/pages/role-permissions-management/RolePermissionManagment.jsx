import React, { useEffect, useState, useMemo } from "react";
import {
  useGetRolesQuery,
  useGetAllPermissionsQuery,
  useUpdateRolePermissionsMutation,
} from "@/services/role/roleApiSlice";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import { Edit } from "lucide-react";
import Modal from "@/components/ui/modal";
import toast from "react-hot-toast";
import SearchBar from "@/components/ui/input/search-bar.jsx";
import { Card } from "@/components/ui/card.jsx";

export default function RolePermissionManagement() {
  const {
    data: roles = [],
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useGetRolesQuery();
  const { data: permissions = [], isLoading: permissionsLoading } =
    useGetAllPermissionsQuery();
  const [updateRolePermissions, { isLoading: updateLoading }] =
    useUpdateRolePermissionsMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectAll, setSelectAll] = useState(false);

  const formatLabel = (str) => {
    return str
      .split(/[-_ ]+/) // split on - _ or space
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Group permissions into modules
  const groupedPermissions = useMemo(() => {
    if (!permissions) return {};
    const grouped = {};
    permissions.forEach((perm) => {
      const [module, action] = perm.name.split(".");
      const formattedModule = formatLabel(module);
      const formattedAction = formatLabel(action);

      if (!grouped[formattedModule]) grouped[formattedModule] = [];
      grouped[formattedModule].push({
        ...perm,
        action: formattedAction, // store formatted action
      });
    });
    return grouped;
  }, [permissions]);

  const filteredGroupedPermissions = useMemo(() => {
    if (!searchTerm) return groupedPermissions;
    const lower = searchTerm.toLowerCase();
    const filtered = {};
    Object.keys(groupedPermissions).forEach((module) => {
      const filteredChildren = groupedPermissions[module].filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          module.toLowerCase().includes(lower) ||
          p.action.toLowerCase().includes(lower),
      );
      if (filteredChildren.length > 0) {
        filtered[module] = filteredChildren;
      }
    });
    return filtered;
  }, [searchTerm, groupedPermissions]);

  // Open modal
  const openPermissionModal = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRole(null);
    setSelectedPermissions([]);
    setSearchTerm("");
    setModalOpen(false);
    setSelectAll(false);
  };

  // Toggle single permission
  const handlePermissionToggle = (permId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  };

  // Toggle all permissions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
      setSelectAll(false);
    } else {
      const allIds = permissions.map((p) => p.id);
      setSelectedPermissions(allIds);
      setSelectAll(true);
    }
  };

  // Toggle module group
  const handleModuleToggle = (module) => {
    const moduleIds = groupedPermissions[module].map((p) => p.id);
    const allSelected = moduleIds.every((id) =>
      selectedPermissions.includes(id),
    );
    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !moduleIds.includes(id)),
      );
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...moduleIds])]);
    }
  };

  // Save changes
  const handleSavePermissions = async () => {
    try {
      await updateRolePermissions({
        id: selectedRole.id,
        payload: { permissionIds: selectedPermissions },
      }).unwrap();
      toast.success("Permissions updated successfully");
      closeModal();
      refetchRoles();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update permissions");
    }
  };

  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Role Name", field: "name" },
    { header: "Permissions", field: "permissions" },
    { header: "Actions", field: "actions" },
  ];

  // Group role permissions for display
  // Table permission formatter with capsules
  const formatPermissionsForTable = (permissions) => {
    if (!permissions || permissions?.length === 0) return "No Permissions";

    const grouped = {};
    permissions?.forEach((perm) => {
      const [module, action] = perm.name.split(".");
      const formattedModule = formatLabel(module);
      const formattedAction = formatLabel(action);

      if (!grouped[formattedModule]) grouped[formattedModule] = [];
      grouped[formattedModule].push(formattedAction);
    });

    return (
      <div className="space-y-2">
        {Object.keys(grouped)
          .sort((a, b) => a.localeCompare(b)) // Sort alphabetically here
          .map((module) => (
            <div key={module} className="flex items-center gap-2">
              <strong>{module} :</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {grouped[module].map((action, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    );
  };

  // Table data
  const tableData = roles?.map((role, i) => ({
    sl: i + 1,
    name: role.name,
    permissions: formatPermissionsForTable(role?.permissions),
    actions: (
      <IconButton
        icon={Edit}
        onClick={() => openPermissionModal(role)}
        title="Edit Permissions"
        className="text-blue-600 hover:text-blue-700"
      />
    ),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Role & Permissions Management</h1>

      <Card className="p-8">
        <ReusableTable
          isPaginated={false}
          data={tableData}
          headers={headers}
          isLoading={rolesLoading}
          enableSearch={false}
        />
      </Card>

      {/* Permissions Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={`Edit Permissions for ${selectedRole?.name || ""}`}
        size="xl"
      >
        {permissionsLoading ? (
          <p>Loading permissions...</p>
        ) : (
          <>
            {/* Search + All Permissions */}
            <div className="flex items-center justify-between mb-4">
              <SearchBar
                placeholder={"Search permissions..."}
                value={searchTerm}
                setSearchValue={setSearchTerm}
                className={"border rounded px-3 py-2 w-[400px]"}
              />
              <PrimaryButton onClick={handleSelectAll} variant="secondary">
                {selectAll ? "Unselect All" : "All Permissions"}
              </PrimaryButton>
            </div>

            {/* Tree View */}
            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {Object.keys(filteredGroupedPermissions).map((module) => {
                const moduleIds = groupedPermissions[module].map((p) => p.id);
                const allModuleSelected = moduleIds.every((id) =>
                  selectedPermissions.includes(id),
                );
                return (
                  <div key={module} className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={allModuleSelected}
                        onChange={() => handleModuleToggle(module)}
                      />
                      <strong>{module}</strong>
                    </div>
                    <div className="ml-6 space-y-1">
                      {filteredGroupedPermissions[module].map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => handlePermissionToggle(perm.id)}
                          />
                          {perm.action}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <PrimaryButton variant="secondary" onClick={closeModal}>
                Cancel
              </PrimaryButton>
              <PrimaryButton
                onClick={handleSavePermissions}
                isLoading={updateLoading}
              >
                Save Changes
              </PrimaryButton>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
