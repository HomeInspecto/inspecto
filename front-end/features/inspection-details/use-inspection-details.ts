// import { Linking } from 'react-native';
// import { useActiveInspectionStore, type ActiveInspection } from './state';
// import { Observation, useActiveObservationStore } from '../edit-observation/state';
// import { useShallow } from 'zustand/react/shallow';
// import type { InspectionDetailsViewProps } from './inspection-details-view';

// export function useInspectionDetails(): InspectionDetailsViewProps {
//   const { activeInspection } = useActiveInspectionStore(
//     useShallow(state => ({
//       activeInspection: state.activeInspection,
//     }))
//   );

//   // const onCreateReport = () => { 
//   //   if (!activeInspection) return;

//   //   const localReal_url = `http://localhost:4321/view/${activeInspection.id}`;
//   //   const vercelReal_url = `https://inspection-report-topaz.vercel.app/view/${activeInspection.id}`;

//   //   const url = `https://inspection-report-topaz.vercel.app/view/${activeInspection.id}`;
//   //   Linking.openURL(localReal_url);

//     // ---------------------------------------------------------------------
//   const onCreateReport = () => {
//     if (!activeInspection) return;

//     const propertyId = activeInspection.property_id; // <-- THIS is the correct ID

//     const url = `http://localhost:4321/view/${propertyId}`;
//     Linking.openURL(url);
//   };

//     // ---------------------------------------------------------------------
//     // if (!activeInspection) return;

//     // const propertyId = activeInspection.property?.id;

//     // if (!propertyId) {
//     //   console.warn("Inspection has no property.id");
//     //   return;
//     // }

//     // // Local Astro dev
//     // const url = `http://localhost:4321/view/${propertyId}`;

//     // Linking.openURL(url);

//     // ---------------------------------------------------------------------
//   };

//   return {
//     inspection: activeInspection,
//     onCreateReport,
//   };
// }
// ---------------------------------------------------------------------// ---------------------------------------------------------------------
import { Linking } from 'react-native';
import { useActiveInspectionStore } from './state';
import { useShallow } from 'zustand/react/shallow';
import type { InspectionDetailsViewProps } from './inspection-details-view';

export function useInspectionDetails(): InspectionDetailsViewProps {
  const { activeInspection } = useActiveInspectionStore(
    useShallow(state => ({
      activeInspection: state.activeInspection,
    }))
  );

  const onCreateReport = () => {
    if (!activeInspection) return;

    // ✅ The API requires a property UUID — NOT the inspection id
    const propertyId = activeInspection.property_id;

    if (!propertyId) {
      console.warn("activeInspection.property_id is missing");
      return;
    }

    const url = `poop`;
    //const url = `http://localhost:4321/view/${propertyId}`;
    Linking.openURL(url);
  };

  return {
    inspection: activeInspection,
    onCreateReport,
  };
}


