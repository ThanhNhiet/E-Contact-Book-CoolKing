import React, { useMemo, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ProfileForm = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: boolean;
};
const genders = ["Nam", "Nữ"];

const getGenderText = (gender: boolean) => (gender ? "Nam" : "Nữ");

interface Props {
  visible: boolean;
  onClose: () => void;
  initialValues?: ProfileForm;
  onSubmit: (values: ProfileForm) => Promise<void> | void; // trả về Promise nếu gọi API
}

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function UpdateProfileModal({
  visible,
  onClose,
  initialValues,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ProfileForm>({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    address: initialValues?.address ?? "",
    dob: initialValues?.dob ?? "",
    gender: initialValues?.gender ?? false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);


  React.useEffect(() => {
    if (visible) {
      setValues({
        name: initialValues?.name ?? "",
        email: initialValues?.email ?? "",
        phone: initialValues?.phone ?? "",
        address: initialValues?.address ?? "",
        dob: initialValues?.dob ?? "",
        gender: initialValues?.gender ?? false,
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [visible, initialValues]);

  const handleChange = (key: keyof ProfileForm, v: any) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!values.name?.trim()) e.name = "Vui lòng nhập họ tên";
    if (values.email && !emailRegex.test(values.email.trim())) e.email = "Email không hợp lệ";
    if (values.phone && values.phone.trim().length < 8) e.phone = "Số điện thoại tối thiểu 8 ký tự";
    if (values.dob && !/^\d{2}\-\d{2}\-\d{4}$/.test(values.dob.trim())) e.dob = "Ngày sinh không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const changed = useMemo(() => {
    const v = values;
    const i = initialValues || {};
    return (
      (v.name ?? "") !== (i.name ?? "") ||
      (v.email ?? "") !== (i.email ?? "") ||
      (v.phone ?? "") !== (i.phone ?? "") ||
      (v.address ?? "") !== (i.address ?? "") ||
        (v.dob ?? "") !== (i.dob ?? "") ||
      (v.gender ?? "") !== (i.gender ?? "")
    );
  }, [values, initialValues]);

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await onSubmit(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={{ width: "100%" }}
        >
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Cập nhật hồ sơ</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Full name */}
              <View style={styles.field}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nhập họ tên"
                  value={values.name}
                  onChangeText={(t) => handleChange("name", t)}
                  editable={false}
                />
                {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="example@domain.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={values.email}
                  onChangeText={(t) => handleChange("email", t)}
                />
                {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Phone */}
              <View style={styles.field}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="0123456789"
                  keyboardType="phone-pad"
                  value={values.phone}
                  onChangeText={(t) => handleChange("phone", t)}
                />
                {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* Address */}
              <View style={styles.field}>
                <Text style={styles.label}>Địa chỉ</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  multiline
                  numberOfLines={3}
                  value={values.address}
                  onChangeText={(t) => handleChange("address", t)}
                />
              </View>

                {/* Date of Birth */}
                <View style={styles.field}>
                    <Text style={styles.label}>Ngày sinh</Text>

                    <TouchableOpacity
                        style={[styles.input, { justifyContent: "center" }]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={{ color: values.dob ? "#0f172a" : "#9ca3af" }}>
                        {values.dob ? values.dob : "Chọn ngày sinh"}
                        </Text>
                    </TouchableOpacity>

                    {!!errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

                    {showDatePicker && (
                        <DateTimePicker
                        value={
                            values.dob
                            ? new Date(values.dob.split("-").reverse().join("-"))
                            : new Date()
                        }
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()} // không cho chọn tương lai
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (event.type === "set" && selectedDate) {
                            const formatted = format(selectedDate, "dd-MM-yyyy");
                            handleChange("dob", formatted);
                            }
                        }}
                        />
                    )}
                    </View>

              {/* Gender (đơn giản bằng 2 nút chọn) */}
              <View style={styles.field}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={styles.segment}>
                        {genders.map((g) => {
                        const active = getGenderText(values.gender ?? false) === g;
                        return (
                            <TouchableOpacity
                            key={g}
                            style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                            onPress={() => handleChange("gender", g === "Nam")}
                            >
                            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                {g}
                            </Text>
                            </TouchableOpacity>
                        );
                        })}
                    </View>
                    </View>


              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
                  <Text style={styles.cancelText}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, (!changed || submitting) && styles.saveBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!changed || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Lưu thay đổi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  field: { marginTop: 12 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14.5,
    color: "#0f172a",
    backgroundColor: "#fbfdff",
  },
  inputError: { borderColor: "#ef4444" },
  errorText: { marginTop: 6, color: "#ef4444", fontSize: 12.5 },

  multiline: { minHeight: 80, textAlignVertical: "top" },

  segment: {
    flexDirection: "row",
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#c7dbf9",
    backgroundColor: "#eaf2ff",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  segmentText: { color: "#0f172a", fontWeight: "700" },
  segmentTextActive: { color: "#fff" },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cancelText: { color: "#0f172a", fontWeight: "700" },

  saveBtn: {
    flex: 1.25,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#4A90E2",
  },
  saveBtnDisabled: { opacity: 0.55 },
  saveText: { color: "#fff", fontWeight: "800" },
});
