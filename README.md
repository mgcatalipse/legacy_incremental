# legacy_incremental
Test of online web incremental about a lineage

## Stat Change Preview Feature

The game includes a stat change preview feature that allows players to see how their character's stats will change before applying selected life events. Here's how it works:

### How to Use
1. **Select Events**: Check the boxes next to the life events you want to apply during the next age-up.
2. **View Previews**: As you select or deselect events, the stats display on the left side will update in real-time, showing your current stats with the proposed changes in parentheses (e.g., "Health: 10 (+5)" means your health will increase by 5).
3. **Review Summary**: Below the events list, a summary shows the total effects and costs from your selected events, helping you make informed decisions.
4. **Apply Changes**: Click the "Age Up" button to apply the selected events and see the changes take effect.

### Key Components
- **Event Listener**: Monitors changes to event checkboxes and triggers updates to the UI.
- **Stat Calculations**: Computes total effects and penalties from selected events using functions like `calculateStatPreviews()` and `calculateTotalPenalties()`.
- **UI Updates**: Refreshes the stats display and events list to reflect previews, ensuring transparency in decision-making.

This feature enhances gameplay by providing immediate feedback, allowing players to experiment with different event combinations without commitment.
