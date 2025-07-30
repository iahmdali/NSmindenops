
import type { Report } from '@/lib/types';

// More detailed mock data aligning with the new operator form
export const tapeheadsSubmissions: Report[] = [
  {
    id: 'rpt_001',
    operatorName: 'B. Johnson',
    shift: 1,
    date: new Date('2023-10-27T08:00:00Z'),
    status: 'Approved',
    shift_lead_name: "Lead A",
    th_number: "TH-1",
    material_type: "Carbon",
    order_entry: "OUS79723-001",
    end_of_shift_status: "Completed",
    shift_start_time: "06:00",
    shift_end_time: "14:00",
    total_meters: 1500,
    total_tapes: 15,
    panels_worked_on: ['P1', 'P2', 'P3'],
    nested_panels: [{value: 'P1a'}, {value: 'P2b'}],
    issues: [],
    had_spin_out: false,
    checklist_items: { 
        smooth_fuse_full: true, blades_glasses: true, paperwork_up_to_date: true, debrief_new_operator: true,
        electric_scissor: true, tubes_at_end_of_table: true, spray_tracks_on_bridge: true, sharpie_pens: true,
        broom: true, cleaned_work_station: true, meter_stick_two_irons: true, th_isle_trash_empty: true 
    },
    leadComments: 'Good work.'
  },
  {
    id: 'rpt_002',
    operatorName: 'S. Davis',
    shift: 1,
    date: new Date('2023-10-27T08:30:00Z'),
    status: 'Requires Attention',
    shift_lead_name: "Lead A",
    th_number: "TH-2",
    material_type: "Fiber",
    order_entry: "OUS79723-101",
    end_of_shift_status: "Completed",
    shift_start_time: "06:00",
    shift_end_time: "14:00",
    total_meters: 1200,
    total_tapes: 12,
    panels_worked_on: ['P1'],
    nested_panels: [],
    issues: [{ problem_reason: "Machine Jam", duration_minutes: 60 }],
    had_spin_out: true,
    spin_out_duration_minutes: 30,
    checklist_items: { 
        smooth_fuse_full: true, blades_glasses: false, paperwork_up_to_date: true, debrief_new_operator: false,
        electric_scissor: true, tubes_at_end_of_table: true, spray_tracks_on_bridge: true, meter_stick: true,
        broom: true, cleaned_work_station: true, meter_stick_two_irons: true, th_isle_trash_empty: true 
    },
    leadComments: 'Please provide more details on the machine issue.'
  },
  {
    id: 'rpt_003',
    operatorName: 'A. Miller',
    shift: 2,
    date: new Date('2023-10-27T16:15:00Z'),
    status: 'Submitted',
    shift_lead_name: "Lead B",
    th_number: "TH-3",
    material_type: "Kevlar",
    end_of_shift_status: "In Progress",
    oe_output_estimate: 500,
    layer: '5 of 12',
    order_entry: "OIT76541-001",
    shift_start_time: "14:00",
    shift_end_time: "22:00",
    total_meters: 1800,
    total_tapes: 18,
    panels_worked_on: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    nested_panels: [],
    issues: [],
    had_spin_out: false,
    checklist_items: {
        smooth_fuse_full: true, blades_glasses: true, paperwork_up_to_date: true, debrief_new_operator: true,
        electric_scissor: true, tubes_at_end_of_table: true, spray_tracks_on_bridge: true, sharpie_pens: true,
        broom: true, cleaned_work_station: true, meter_stick_two_irons: true, th_isle_trash_empty: true
    },
  },
];
