package com.sharefair.service;

import com.sharefair.dto.SustainabilityReportDto;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class SustainabilityReportService {

    private final DSLContext dsl;

    public SustainabilityReportService(DSLContext dsl) {
        this.dsl = dsl;
    }

    public SustainabilityReportDto getCommunityReport() {
        BigDecimal totalCarbon = getTotalCarbonSaved();
        long totalTransactions = getTotalCompletedTransactions();
        long activeUsers = getActiveUsers();
        BigDecimal avg = totalTransactions > 0
                ? totalCarbon.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return SustainabilityReportDto.builder()
                .totalCarbonSavedKg(totalCarbon)
                .totalCompletedTransactions(totalTransactions)
                .totalActiveUsers(activeUsers)
                .avgCarbonPerTransaction(avg)
                .carbonByCategory(getCarbonByCategory())
                .monthlyTrend(getMonthlyTrend())
                .topContributors(getTopContributors(10))
                .build();
    }

    public SustainabilityReportDto getUserReport(String userId) {
        BigDecimal userCarbon = dsl
                .select(DSL.sum(DSL.field("carbon_saved_kg", BigDecimal.class)))
                .from(DSL.table("carbon_saved"))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .fetchOne(0, BigDecimal.class);
        userCarbon = userCarbon != null ? userCarbon : BigDecimal.ZERO;

        long userTx = dsl
                .selectCount()
                .from(DSL.table("transactions"))
                .where(DSL.field("status").eq("COMPLETED"))
                .and(DSL.field("borrower_id").eq(UUID.fromString(userId))
                        .or(DSL.field("owner_id").eq(UUID.fromString(userId))))
                .fetchOne(0, Long.class);

        String tier = dsl
                .select(DSL.field("tier"))
                .from(DSL.table("trust_scores"))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .fetchOne(0, String.class);

        // Rank: how many users have more carbon saved
        Integer rank = dsl
                .select(DSL.count().plus(1))
                .from(
                        dsl.select(DSL.field("user_id"))
                                .from(DSL.table("carbon_saved"))
                                .groupBy(DSL.field("user_id"))
                                .having(DSL.sum(DSL.field("carbon_saved_kg", BigDecimal.class)).gt(userCarbon))
                                .asTable("leaders")
                )
                .fetchOne(0, Integer.class);

        BigDecimal totalCarbon = getTotalCarbonSaved();
        long totalTransactions = getTotalCompletedTransactions();
        long activeUsers = getActiveUsers();
        BigDecimal avg = totalTransactions > 0
                ? totalCarbon.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return SustainabilityReportDto.builder()
                .totalCarbonSavedKg(totalCarbon)
                .totalCompletedTransactions(totalTransactions)
                .totalActiveUsers(activeUsers)
                .avgCarbonPerTransaction(avg)
                .carbonByCategory(getCarbonByCategory())
                .monthlyTrend(getMonthlyTrend())
                .topContributors(getTopContributors(5))
                .userTotalCarbonSavedKg(userCarbon)
                .userCompletedTransactions(userTx)
                .userTier(tier)
                .userRank(rank)
                .build();
    }

    private BigDecimal getTotalCarbonSaved() {
        BigDecimal total = dsl
                .select(DSL.sum(DSL.field("carbon_saved_kg", BigDecimal.class)))
                .from(DSL.table("carbon_saved"))
                .fetchOne(0, BigDecimal.class);
        return total != null ? total.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private long getTotalCompletedTransactions() {
        return dsl
                .selectCount()
                .from(DSL.table("transactions"))
                .where(DSL.field("status").eq("COMPLETED"))
                .fetchOne(0, Long.class);
    }

    private long getActiveUsers() {
        return dsl
                .select(DSL.countDistinct(DSL.field("user_id")))
                .from(DSL.table("carbon_saved"))
                .fetchOne(0, Long.class);
    }

    private List<Map<String, Object>> getCarbonByCategory() {
        return dsl
                .select(
                        DSL.field("l.category"),
                        DSL.sum(DSL.field("cs.carbon_saved_kg", BigDecimal.class)).as("total_carbon"),
                        DSL.count().as("transaction_count")
                )
                .from(DSL.table("carbon_saved cs"))
                .join(DSL.table("transactions t")).on(DSL.field("cs.transaction_id").eq(DSL.field("t.id")))
                .join(DSL.table("listings l")).on(DSL.field("t.listing_id").eq(DSL.field("l.id")))
                .groupBy(DSL.field("l.category"))
                .orderBy(DSL.field("total_carbon").desc())
                .fetch()
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("category", r.get("category", String.class));
                    m.put("totalCarbon", r.get("total_carbon", BigDecimal.class));
                    m.put("transactionCount", r.get("transaction_count", Long.class));
                    return m;
                });
    }

    private List<Map<String, Object>> getMonthlyTrend() {
        // Last 6 months
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(5).withDayOfMonth(1);

        return dsl
                .select(
                        DSL.field("TO_CHAR(cs.created_at, 'YYYY-MM')").as("month"),
                        DSL.sum(DSL.field("cs.carbon_saved_kg", BigDecimal.class)).as("carbon_saved"),
                        DSL.count().as("transactions")
                )
                .from(DSL.table("carbon_saved cs"))
                .where(DSL.field("cs.created_at").ge(sixMonthsAgo.atStartOfDay()))
                .groupBy(DSL.field("TO_CHAR(cs.created_at, 'YYYY-MM')"))
                .orderBy(DSL.field("month").asc())
                .fetch()
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("month", r.get("month", String.class));
                    m.put("carbonSaved", r.get("carbon_saved", BigDecimal.class));
                    m.put("transactions", r.get("transactions", Long.class));
                    return m;
                });
    }

    private List<Map<String, Object>> getTopContributors(int limit) {
        return dsl
                .select(
                        DSL.field("cs.user_id"),
                        DSL.field("u.name"),
                        DSL.field("u.avatar"),
                        DSL.sum(DSL.field("cs.carbon_saved_kg", BigDecimal.class)).as("total_carbon"),
                        DSL.count().as("transaction_count")
                )
                .from(DSL.table("carbon_saved cs"))
                .join(DSL.table("users u")).on(DSL.field("cs.user_id").eq(DSL.field("u.id")))
                .groupBy(DSL.field("cs.user_id"), DSL.field("u.name"), DSL.field("u.avatar"))
                .orderBy(DSL.field("total_carbon").desc())
                .limit(limit)
                .fetch()
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("userId", r.get("user_id", String.class));
                    m.put("name", r.get("name", String.class));
                    m.put("avatar", r.get("avatar", String.class));
                    m.put("totalCarbon", r.get("total_carbon", BigDecimal.class));
                    m.put("transactionCount", r.get("transaction_count", Long.class));
                    return m;
                });
    }
}
