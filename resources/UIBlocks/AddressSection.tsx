import FloatingInput from "../components/input/floating-input";
import ImageButton from "../components/button/ImageBtn";
import { TextArea } from "../components/input/text-area";
import Radio_group from "../../resources/components/radioGroup/radio_group";
import { useState } from "react";
import Button from "../../resources/components/button/Button";

function AddressSection() {
  const [address] = useState([
    {
      value: "address1",
      label: "Muthu",
      description: `123, MG Road
City: Bengaluru
State: Karnataka
Pincode: 560001
Phone: +91 9876543210`,
    },
    {
      value: "address2",
      label: "Muthu",
      description: `123, MG Road
City: Bengaluru
State: Karnataka
Pincode: 560001
Phone: +91 9876543210`,
    },
    {
      value: "address3",
      label: "Muthu",
      description: `123, MG Road
City: Bengaluru
State: Karnataka
Pincode: 560001
Phone: +91 9876543210`,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [choosenAddress, setChoosenAddress] = useState("address1");

  const initialForm = {
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    secondaryPhone: "",
    pincode: "",
    locality: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = "Required";
    if (!form.phone) newErrors.phone = "Required";
    if (!form.address) newErrors.address = "Required";
    if (!form.city) newErrors.city = "Required";
    if (!form.state) newErrors.state = "Required";
    if (!form.pincode) newErrors.pincode = "Required";
    if (!form.locality) newErrors.locality = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Submitted Address:", form);
      setShowForm(false);
      setForm(initialForm); // ✅ Reset after submit
    }
  };

  return (
    <div className="block space-y-3 mr-auto w-full bg-background">
      {!showForm && (
        <>
          <ImageButton
            label="Add New Address"
            icon="plus"
            onClick={() => setShowForm(true)}
            className="border bg-update/20 w-full p-2 text-update border-update/90"
          />
          <Radio_group
            name="address"
            defaultValue={choosenAddress}
            options={address}
            onChange={(value) => setChoosenAddress(value)}
          />
        </>
      )}

      {showForm && (
        <div className="flex flex-col gap-5">
          <h3 className="text-update">ADD A NEW ADDRESS</h3>
          <div className="grid grid-cols-2 gap-5">
            <FloatingInput
              id="name"
              label="Name"
              value={form.name}
              err={errors.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <FloatingInput
              id="phone"
              label="Phone"
              value={form.phone}
              err={errors.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <TextArea
            label="Address"
            value={form.address}
            err={errors.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-5">
            <FloatingInput
              id="city"
              label="City/District"
              value={form.city}
              err={errors.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
            <FloatingInput
              id="state"
              label="State"
              value={form.state}
              err={errors.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <FloatingInput
              id="landmark"
              label="Landmark (optional)"
              value={form.landmark}
              err=""
              onChange={(e) => handleChange("landmark", e.target.value)}
            />
            <FloatingInput
              id="secondaryPhone"
              label="Secondary Phone"
              value={form.secondaryPhone}
              err=""
              onChange={(e) => handleChange("secondaryPhone", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <FloatingInput
              id="pincode"
              label="Pincode"
              value={form.pincode}
              err={errors.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
            />
            <FloatingInput
              id="locality"
              label="Locality"
              value={form.locality}
              err={errors.locality}
              onChange={(e) => handleChange("locality", e.target.value)}
            />
          </div>

          <Radio_group
            name="timing"
            options={[
              { label: "Home (Every Day)", value: "home" },
              { label: "Work (MON - SAT : 10AM - 5PM)", value: "work" },
            ]}
          />

          <div className="flex gap-4">
            <Button
              className="bg-update text-update-foreground"
              label="DELIVER HERE"
              onClick={handleSubmit} // ✅ Correct call
            />
            <Button
              className="text-delete"
              label="Cancel"
              onClick={() => {
                setShowForm(false);
                setForm(initialForm);
                setErrors({});
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressSection;
