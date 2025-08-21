import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

class CustomTabBar extends StatefulWidget {
  final List<String> tabs;
  final List<Widget> children;
  final ValueChanged<int>? onTabChanged;
  final int initialTab;
  final ScrollPhysics physics;
  const CustomTabBar(
      {super.key,
      required this.tabs,
      required this.children,
      this.onTabChanged,
      this.initialTab = 0,
      this.physics = const BouncingScrollPhysics()});

  @override
  State<CustomTabBar> createState() => _CustomTabBarState();
}

class _CustomTabBarState extends State<CustomTabBar>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: widget.tabs.length,
      vsync: this,
      initialIndex: widget.initialTab,
    );

    _tabController.addListener(() {
      if (widget.onTabChanged != null) {
        widget.onTabChanged!(_tabController.index);
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          decoration: const BoxDecoration(
            color: Colors.white,
          ),
          child: Column(
            children: [
              TabBar(
                controller: _tabController,
                isScrollable: true,
                labelColor: AppColors.brandPrimary600,
                unselectedLabelColor: AppColors.brandNeutral500,
                dividerColor: Colors.transparent,
                indicator: const CustomTabIndicator(
                  color: AppColors.brandPrimary600,
                  width: 44,
                  height: 2,
                ),
                overlayColor: WidgetStateProperty.all(Colors.transparent),
                indicatorSize: TabBarIndicatorSize.tab,
                tabAlignment: TabAlignment.start,
                padding: EdgeInsets.zero,
                labelPadding: EdgeInsets.zero,
                tabs: widget.tabs.asMap().entries.map((entry) {
                  final index = entry.key;
                  final tab = entry.value;
                  EdgeInsets tabPadding;

                  if (index == 0) {
                    tabPadding = const EdgeInsets.fromLTRB(12, 0, 16, 0);
                  } else if (index == widget.tabs.length - 1) {
                    tabPadding = const EdgeInsets.fromLTRB(16, 0, 12, 0);
                  } else {
                    tabPadding = const EdgeInsets.symmetric(horizontal: 16);
                  }

                  return SizedBox(
                    height: 36,
                    child: Center(
                      child: Padding(
                        padding: tabPadding,
                        child: Text(
                          tab,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            height: 1.4,
                            fontFamily: 'Montserrat',
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12.0),
                child: Divider(
                  thickness: 1,
                  height: 1,
                  color: AppColors.brandNeutral200,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            physics: const NeverScrollableScrollPhysics(),
            children: widget.children.map((child) {
              return Column(
                children: [
                  Expanded(child: child), // Forces all tabs to take full space
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );

    //   return Column(
    //     children: [
    //       Container(
    //         decoration: const BoxDecoration(
    //           color: Colors.white,
    //         ),
    //         child: Column(
    //           children: [
    //             TabBar(
    //               controller: _tabController,
    //               isScrollable: true,
    //               labelColor: AppColors.brandPrimary600,
    //               unselectedLabelColor: AppColors.brandNeutral500,
    //               dividerColor: Colors.transparent,
    //               indicator: const CustomTabIndicator(
    //                 color: AppColors.brandPrimary600,
    //                 width: 44,
    //                 height: 2,
    //               ),
    //               overlayColor: MaterialStateProperty.all(Colors.transparent),
    //               indicatorSize: TabBarIndicatorSize.tab,
    //               tabAlignment: TabAlignment.start,
    //               padding: EdgeInsets.zero,
    //               labelPadding: EdgeInsets.zero,
    //               tabs: widget.tabs.asMap().entries.map((entry) {
    //                 final index = entry.key;
    //                 final tab = entry.value;
    //                 EdgeInsets tabPadding;

    //                 if (index == 0) {
    //                   tabPadding = const EdgeInsets.fromLTRB(12, 0, 16, 0);
    //                 } else if (index == widget.tabs.length - 1) {
    //                   tabPadding = const EdgeInsets.fromLTRB(16, 0, 12, 0);
    //                 } else {
    //                   tabPadding = const EdgeInsets.symmetric(horizontal: 16);
    //                 }

    //                 return SizedBox(
    //                   height: 36,
    //                   child: Center(
    //                     child: Padding(
    //                       padding: tabPadding,
    //                       child: Text(
    //                         tab,
    //                         style: const TextStyle(
    //                           fontSize: 14,
    //                           fontWeight: FontWeight.w500,
    //                           height: 1.4,
    //                           fontFamily: 'DM Sans',
    //                         ),
    //                       ),
    //                     ),
    //                   ),
    //                 );
    //               }).toList(),
    //             ),
    //             const Padding(
    //               padding: EdgeInsets.symmetric(horizontal: 12.0),
    //               child: Divider(
    //                 thickness: 1,
    //                 height: 1,
    //                 color: AppColors.brandNeutral200,
    //               ),
    //             ),
    //           ],
    //         ),
    //       ),
    //       Expanded(
    //         child: TabBarView(
    //           controller: _tabController,
    //            physics: NeverScrollableScrollPhysics(),
    //           children: widget.children,

    //         ),
    //       ),
    //     ],
    //   );
    // }
  }
}

class CustomTabIndicator extends Decoration {
  final Color color;
  final double width;
  final double height;

  const CustomTabIndicator({
    required this.color,
    required this.width,
    this.height = 2,
  });

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) {
    return _CustomTabIndicatorPainter(
      color: color,
      width: width,
      height: height,
    );
  }
}

class _CustomTabIndicatorPainter extends BoxPainter {
  final Color color;
  final double width;
  final double height;

  _CustomTabIndicatorPainter({
    required this.color,
    required this.width,
    required this.height,
  });

  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration configuration) {
    assert(configuration.size != null);

    final Rect rect = offset & configuration.size!;
    final Paint paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final double center = rect.center.dx;
    final double left = center - (width / 2);

    canvas.drawRect(
      Rect.fromLTWH(left, configuration.size!.height - height, width, height),
      paint,
    );
  }
}
