# Seed Data Guide

This guide explains how to populate your ZERO platform database with demo/testing data.

## Overview

The seed data script (`supabase/seed.sql`) creates realistic demo data for all major features:

- **12 months** of carbon emissions history (showing improvement trend)
- **5** top emission sources
- **9** waste material listings (6 available for purchase, 3 sold/reserved)
- **5** marketplace transactions (3 completed, 1 active, 1 pending)
- **8** carbon offset projects (diverse types and regions)
- **3** carbon credit purchases (225 tons total)

## Data Summary

### Carbon Emissions
- **Starting emissions**: ~230 tons CO2e/month (12 months ago)
- **Current emissions**: ~186 tons CO2e/month (19% reduction)
- **Breakdown**: Scope 1 (~36 tons), Scope 2 (~47 tons), Scope 3 (~103 tons)
- **Top Sources**: Electricity (47 tons), Purchased Goods (35 tons), Fleet Vehicles (26 tons)

### Marketplace Activity
- **Total transactions**: 5 (3 completed, 1 active, 1 pending)
- **Materials traded**: Plastic (PET, PP), Paper, Metal (Aluminum, Copper)
- **Revenue generated**: ~$30,000 from completed sales
- **Estimated carbon impact**: ~7.9 tons CO2e avoided

### Carbon Offsets
- **Purchased credits**: 225 tons CO2e
- **Investment**: $3,550 in carbon offsets
- **Projects supported**: Amazon Reforestation, North Sea Wind Farm, Kenya Cookstoves

### Net Zero Progress
With current data:
- **Total emissions**: ~186 tons CO2e/month
- **Total offsets**: 225 + 7.9 = ~233 tons CO2e
- **Progress**: Approximately on track for net-zero target

## How to Use

### Option 1: Via Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/seed.sql`
5. Paste and run the script
6. Verify data in the **Table Editor**

### Option 2: Via Supabase CLI

```bash
# Ensure you're in the project directory
cd /path/to/Zero-Project

# Run the seed script
supabase db reset --db-url "your-database-url"

# Or execute the seed file directly
psql "your-database-url" -f supabase/seed.sql
```

### Option 3: Via Migration

```bash
# Create a new migration with the seed data
supabase migration new seed_demo_data

# Copy seed.sql contents to the new migration file
# Then apply migrations
supabase db push
```

## Important Notes

⚠️ **WARNING**: This seed script inserts demo data. **DO NOT** run this on a production database!

- All data is associated with the currently authenticated user (`auth.uid()`)
- You must be logged in when running the script
- Some data uses the same user as both buyer and seller for demo purposes
- In production, you would have separate buyer/seller accounts

## Testing the Features

After seeding the database, you can test:

### Dashboard
- View carbon footprint metrics with real historical data
- See circular economy revenue and estimated carbon impact
- Track compliance progress

### Carbon Engine
- View emissions by scope (pie chart)
- Analyze Scope 3 breakdown by category
- Review 12-month emissions trend (showing improvement)
- See top emission sources with percentages

### Marketplace
- Browse 6 available waste material listings
- View pricing and material details
- See quality grades and certifications

### My Transactions
- View transaction history (5 transactions)
- Filter by status (all, active, pending, completed)
- See revenue metrics and estimated carbon impact
- Accept/reject pending transactions (1 pending)
- Mark active transactions as complete (1 active)

### Transaction Details
- View completed transactions with estimated carbon credits
- Click "Start Verification Process" button
- Test the 6-step verification checklist

### Carbon Offset Marketplace
- Browse 8 diverse offset projects
- Search by project name, type, or country
- View project details and co-benefits
- See available credits and pricing

## Modifying the Data

To customize the seed data for your needs:

1. Open `supabase/seed.sql`
2. Modify values in the INSERT statements:
   - **Emission amounts**: Adjust tons CO2e values
   - **Material quantities**: Change available inventory
   - **Pricing**: Update price_per_unit values
   - **Dates**: Adjust INTERVAL values for different timeframes
3. Add or remove records as needed
4. Re-run the seed script

## Cleaning Up

To remove all seed data:

```sql
-- Delete in reverse order to respect foreign key constraints
DELETE FROM carbon_credit_purchases WHERE user_id = auth.uid();
DELETE FROM transactions WHERE seller_id = auth.uid() OR buyer_id = auth.uid();
DELETE FROM waste_materials WHERE seller_id = auth.uid();
DELETE FROM emission_sources WHERE user_id = auth.uid();
DELETE FROM carbon_emissions WHERE user_id = auth.uid();
-- Carbon offset projects are shared, so only delete if needed
-- DELETE FROM carbon_offset_projects;
```

## Support

If you encounter issues with the seed data:

1. Check that you're authenticated in Supabase
2. Verify your database schema matches the expected structure
3. Check for foreign key constraint errors
4. Ensure the `calculate_carbon_credits()` function exists in your database

## Next Steps

After seeding the database:

1. **Test the full user flow**: Browse marketplace → Make purchase → Complete transaction → Verify carbon credits
2. **Verify calculations**: Ensure carbon credit estimates are accurate
3. **Check data visualization**: All charts should display properly
4. **Test filters and search**: Ensure all filtering works correctly
5. **Review empty states**: Delete some data to test empty state handling
